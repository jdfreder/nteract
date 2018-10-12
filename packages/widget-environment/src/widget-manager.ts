import * as widgets from '@jupyter-widgets/jupyterlab-manager'
import { JupyterLab } from '@jupyterlab/application';
import { IDisposable } from '@phosphor/disposable';
import { Context, DocumentRegistry } from '@jupyterlab/docregistry';
import { INotebookModel, NotebookPanel, NotebookModelFactory, Notebook } from '@jupyterlab/notebook';
import { ClientSession } from '@jupyterlab/apputils';
import { Kernel, SessionManager, ServiceManager } from '@jupyterlab/services';
import { Subject, Subscription } from 'rxjs';
import { ShimMessage, SHIM_MESSAGE_TYPE, RenderShimMessage, createMessage } from './shim-message';
import { ShimKernel } from './shim-kernel';
import { RenderMimeRegistry, IRenderMime } from '@jupyterlab/rendermime';
import { KernelSession } from './kernel-session';
import { filter, map } from 'rxjs/operators';
import { ReadonlyJSONObject } from '@phosphor/coreutils';
import { ShimServiceManager } from './shim-service-manager';

export class WidgetManager implements IDisposable {
  readonly isDisposed: boolean =  false;
  dispose() {}

  private kernel: Kernel.IKernelConnection;
  private rendermime: RenderMimeRegistry;
  private target: HTMLElement;
  private renderSubscription: Subscription;
  private shimMessages: Subject<ShimMessage>;

  constructor(messages: Subject<ShimMessage>, target: HTMLElement) {
    this.kernel = new ShimKernel(messages);
    this.target = target;
    this.shimMessages = messages;

   // TODO listen to messages, specifically for the display requests.
    this.renderSubscription = messages.pipe(
        filter(message => message.type === SHIM_MESSAGE_TYPE.RENDER),
        map(message => message as RenderShimMessage)).subscribe(async (message) => {
          await this.render(message.mimetype, {
            metadata: message.metadata as ReadonlyJSONObject, 
            data: {[message.mimetype]: message.data} as ReadonlyJSONObject, 
            trusted: true, 
            setData() {}})
        });
  }

  async activate() {
    const serviceManager = new ShimServiceManager({}) as any as ServiceManager;
    const docRegistry = new DocumentRegistry({});
    const jupyterLab = new JupyterLab({ docRegistry, serviceManager });

    const sessionManager = serviceManager.sessions;
    const session = new KernelSession(this.kernel, sessionManager);

    class ShimContext extends Context<INotebookModel> {
      public readonly session: ClientSession = session;
    }

    const rendermime = new RenderMimeRegistry();
    this.rendermime = rendermime;
    const context = new ShimContext({
      manager: serviceManager,
      factory: new NotebookModelFactory({}),
      path: 'unknown',
    });
    const notebook = new Notebook({rendermime, mimeTypeService: {
      getMimeTypeByFilePath(filePath: string): string {
        return 'unknown';
      },
      getMimeTypeByLanguage(info: any): string {
        return 'unknown';
      },
    }});

    const notebookPanel = new NotebookPanel({context, content: notebook});
    const widgetRegisty = widgets.default.activate(jupyterLab);
    const matchingExtensions = docRegistry.widgetExtensions('Notebook');
    const extension = matchingExtensions.next();
    const disposable = extension.createNew(notebookPanel, context);
    await this.requestWidgetState();
    this.shimMessages.next(createMessage(SHIM_MESSAGE_TYPE.ALIVE));
  }

  private async requestWidgetState() {
    // Send CommInfoShimMessage for widget comms

    // Response CommInfoShimMessage
    // content.comms

    // Emulate comm open messages for each comm.

    // For each comm send:
    // comm.send
    // {method: 'request_state'}
  }

  private async render(mimetype: string, model: IRenderMime.IMimeModel): Promise<void> {
    // Remove everything currently rendered and replace it with a new renderer.
    while (this.target.firstChild) {
      this.target.removeChild(this.target.firstChild);
    }
    const renderer = this.rendermime.createRenderer(mimetype);
    this.target.appendChild(renderer.node);

    // Render the model into the node which has been appended to the page.
    console.log('rendering: ', model);
    await renderer.renderModel(model);
  }
}

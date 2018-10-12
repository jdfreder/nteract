import { ServiceManager, Kernel, ContentsManager, SettingManager, TerminalManager, WorkspaceManager, NbConvertManager, ServerConnection, SessionManager, Session } from "@jupyterlab/services";
import { ShimSessionManager } from "./shim-session-manager";
import { BuildManager } from "@jupyterlab/services/lib/builder";
import { ISignal } from "@phosphor/signaling";

export class ShimServiceManager implements ServiceManager.IManager  {
  /**
   * Construct a new services provider.
   */
  constructor(options: ServiceManager.IOptions = {}) {
    this.serverSettings =
      options.serverSettings || ServerConnection.makeSettings();

    this.contents = new ContentsManager(options);
    this.settings = new SettingManager(options);
    this.terminals = new TerminalManager(options);
    this.builder = new BuildManager(options);
    this.workspaces = new WorkspaceManager(options);
    this.nbconvert = new NbConvertManager(options);

    // Force cast ShimSessionManager to SessionManager
    this.sessions = (new ShimSessionManager(options) as any) as SessionManager;

    this._readyPromise = this.sessions.ready.then(() => {
      if (this.terminals.isAvailable()) {
        return this.terminals.ready;
      }
    });
    this._readyPromise.then(() => {
      this._isReady = true;
    });
  }

  /**
   * Test whether the service manager is disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Dispose of the resources used by the manager.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this._isDisposed = true;

    this.contents.dispose();
    this.sessions.dispose();
    this.terminals.dispose();
  }

  /**
   * The kernel spec models.
   */
  get specs(): Kernel.ISpecModels | null {
    return this.sessions.specs;
  }

  readonly specsChanged: ISignal<ServiceManager.IManager, Kernel.ISpecModels>

  /**
   * The server settings of the manager.
   */
  readonly serverSettings: ServerConnection.ISettings;

  /**
   * Get the session manager instance.
   */
  readonly sessions: SessionManager;

  /**
   * Get the setting manager instance.
   */
  readonly settings: SettingManager;

  /**
   * The builder for the manager.
   */
  readonly builder: BuildManager;

  /**
   * Get the contents manager instance.
   */
  readonly contents: ContentsManager;

  /**
   * Get the terminal manager instance.
   */
  readonly terminals: TerminalManager;

  /**
   * Get the workspace manager instance.
   */
  readonly workspaces: WorkspaceManager;

  /**
   * Get the nbconvert manager instance.
   */
  readonly nbconvert: NbConvertManager;

  /**
   * Test whether the manager is ready.
   */
  get isReady(): boolean {
    return this._isReady;
  }

  /**
   * A promise that fulfills when the manager is ready.
   */
  get ready(): Promise<void> {
    return this._readyPromise;
  }

  private _isDisposed = false;
  private _readyPromise: Promise<void>;
  private _isReady = false;
}
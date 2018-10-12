import { Kernel, KernelMessage } from "@jupyterlab/services";
import { JSONObject } from "@phosphor/coreutils";


export abstract class MockKernel implements Kernel.IKernelConnection {
  dispose() {}
  readonly isDisposed = false;
  readonly id: string = 'unknown';
  readonly name: string = 'unknown';
  readonly model: Kernel.IModel = {
    id: 'unknown',
    name: 'unknown',
  };
  readonly username: string = 'unknown';
  readonly clientId: string = 'unknown';
  readonly status: Kernel.Status = 'idle';

  /**
   * The cached kernel info.
   * Typically this value is null until the kernel is ready, but we don't care
   * to set it.
   */
  readonly info: any = null;

  /**
   * Test whether the kernel is ready.
   */
  readonly isReady: boolean = true;

  /**
   * A promise that resolves when the kernel is initially ready after a start
   * or restart.
   */
  readonly ready: Promise<void>;

  /**
   * Get the kernel spec.
   * @returns A promise that resolves with the kernel spec for this kernel.
   */
  getSpec(): Promise<Kernel.ISpecModel> {
    return Promise.resolve({
      argv: [],
      display_name: 'unknown',
      end: {},
      language: 'unknown',
      name: 'unknown',
      resources: {},
    });
  }


  /**
   * Send a `comm_info_request` message.
   * @param content - The content of the request.
   * @returns A promise that resolves with the response message.
   */
  abstract requestCommInfo(
    content: KernelMessage.ICommInfoRequest
  ): Promise<KernelMessage.ICommInfoReplyMsg>;

  /**
   * Connect to a comm, or create a new one.
   *
   * @param targetName - The name of the comm target.
   * @param id - The comm id.
   * @returns A comm instance.
   */
  abstract connectToComm(targetName: string, commId?: string): Kernel.IComm;

  /**
   * Register a comm target handler.
   *
   *
   * @param callback - The callback invoked for a comm open message.
   *
   * #### Notes
   * Only one comm target can be registered to a target name at a time, an
   * existing callback for the same target name will be overridden.  A registered
   * comm target handler will take precedence over a comm which specifies a
   * `target_module`.
   *
   * If the callback returns a promise, kernel message processing will pause
   * until the returned promise is fulfilled.
   */
  abstract registerCommTarget(
    targetName: string,
    callback: (
      comm: Kernel.IComm,
      msg: KernelMessage.ICommOpenMsg
    ) => void | PromiseLike<void>
  ): void;

  /**
   * Removes a comm target handler.
   *
   * @param targetName - The name of the comm target to remove.
   * @param callback - The callback to remove.
   *
   * #### Notes
   * The comm target is only removed if it matches the callback argument.
   */
  abstract removeCommTarget(
    targetName: string,
    callback: (
      comm: Kernel.IComm,
      msg: KernelMessage.ICommOpenMsg
    ) => void | PromiseLike<void>
  ): void;

  /**
   * Send a shell message to the kernel.
   * @param msg - The fully-formed shell message to send.
   * @param expectReply - Whether to expect a shell reply message.
   * @param disposeOnDone - Whether to dispose of the future when done.
   */
  sendShellMessage(
    msg: KernelMessage.IShellMessage,
    expectReply?: boolean,
    disposeOnDone?: boolean
  ): Kernel.IFuture {
    return null;
  }

  /**
   * Reconnect to a disconnected kernel.
   * @returns A promise that resolves when the kernel has reconnected.
   */
  reconnect(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Interrupt a kernel.
   * @returns A promise that resolves when the kernel has interrupted.
   */
  interrupt(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Restart a kernel.
   * @returns A promise that resolves when the kernel has restarted.
   */
  restart(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Send a `kernel_info_request` message.
   * @param content - The content of the request.
   * @returns A promise that resolves with the response message.
   */
  requestKernelInfo(): Promise<KernelMessage.IInfoReplyMsg> {
    return Promise.resolve(null);
  }

  /**
   * Send a `complete_request` message.
   * @param content - The content of the request.
   * @returns A promise that resolves with the response message.
   */
  requestComplete(
    content: KernelMessage.ICompleteRequest
  ): Promise<KernelMessage.ICompleteReplyMsg> {
    return Promise.resolve(null);
  }

  /**
   * Send an `inspect_request` message.
   * @param content - The content of the request.
   * @returns A promise that resolves with the response message.
   */
  requestInspect(
    content: KernelMessage.IInspectRequest
  ): Promise<KernelMessage.IInspectReplyMsg> {
    return Promise.resolve(null);
  }

  /**
   * Send a `history_request` message.
   * @param content - The content of the request.
   * @returns A promise that resolves with the response message.
   */
  requestHistory(
    content: KernelMessage.IHistoryRequest
  ): Promise<KernelMessage.IHistoryReplyMsg> {
    return Promise.resolve(null);
  }

  /**
   * Send an `execute_request` message.
   * @param content - The content of the request.
   * @param disposeOnDone - Whether to dispose of the future when done.
   * @returns A kernel future.
   */
  requestExecute(
    content: KernelMessage.IExecuteRequest,
    disposeOnDone?: boolean,
    metadata?: JSONObject
  ): Kernel.IFuture {
    return null;
  }

  /**
   * Send an `is_complete_request` message.
   * @param content - The content of the request.
   * @returns A promise that resolves with the response message.
   */
  requestIsComplete(
    content: KernelMessage.IIsCompleteRequest
  ): Promise<KernelMessage.IIsCompleteReplyMsg> {
    return Promise.resolve(null);
  }

  /**
   * Send an `input_reply` message.
   * @param content - The content of the reply.
   */
  sendInputReply(content: KernelMessage.IInputReply): void {}

  /**
   * Registers an IOPub message hook.
   *
   * @param msg_id - The parent_header message id in messages the hook should
   * intercept.
   * @param hook - The callback invoked for the message.
   *
   * #### Notes
   * The IOPub hook system allows you to preempt the handlers for IOPub
   * messages with a given parent_header message id. The most recently
   * registered hook is run first. If a hook return value resolves to false,
   * any later hooks and the future's onIOPub handler will not run. If a hook
   * throws an error, the error is logged to the console and the next hook is
   * run. If a hook is registered during the hook processing, it will not run
   * until the next message. If a hook is disposed during the hook processing,
   * it will be deactivated immediately.
   *
   * See also [[IFuture.registerMessageHook]].
   */
  registerMessageHook(
    msgId: string,
    hook: (msg: KernelMessage.IIOPubMessage) => boolean | PromiseLike<boolean>
  ): void {}

  /**
   * Removes an IOPub message hook.
   * @param msg_id - The parent_header message id the hook intercepted.
   * @param hook - The callback invoked for the message.
   */
  removeMessageHook(
    msgId: string,
    hook: (msg: KernelMessage.IIOPubMessage) => boolean | PromiseLike<boolean>
  ): void {}
}
import { Kernel, KernelMessage } from "@jupyterlab/services";

export class MsgFuture implements Kernel.IFuture {
  done: Promise<KernelMessage.IShellMessage | undefined>
  isDisposed: boolean
  dispose() {}
  msg: KernelMessage.IShellMessage
  onIOPub(msg: KernelMessage.IIOPubMessage): void | PromiseLike<void> {}
  onReply(msg: KernelMessage.IShellMessage): void | PromiseLike<void> {}
  onStdin(msg: KernelMessage.IStdinMessage): void | PromiseLike<void> {}
  registerMessageHook(hook: (msg: KernelMessage.IIOPubMessage) => boolean | PromiseLike<boolean>): void {}
  removeMessageHook(hook: (msg: KernelMessage.IIOPubMessage) => boolean | PromiseLike<boolean>): void {}
  sendInputReply(content: KernelMessage.IInputReply): void {}
}
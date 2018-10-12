import { Kernel, KernelMessage } from "@jupyterlab/services";
import { JSONValue, JSONObject } from "@phosphor/coreutils";
import { Subject, Subscription } from "rxjs";
import { ShimMessage, SHIM_MESSAGE_TYPE, CommMsgShimMessage, CommCloseShimMessage, toCommMsg, createMessage, CommOpenShimMessage } from "./shim-message";
import { filter, map } from "rxjs/operators";
import { MsgFuture } from "./msg-future";

export class ShimComm implements Kernel.IComm {
  private messages: Subject<ShimMessage>;
  private _targetName: string;
  private _commId: string;
  private messageSubscription: Subscription;
  private closeSubscription: Subscription;

  constructor(targetName: string, commId: string, messages: Subject<ShimMessage>) {
    this.messages = messages;
    this._commId = commId;
    this._targetName = targetName;

    this.messageSubscription = messages.pipe(
      filter(message => message.type === SHIM_MESSAGE_TYPE.COMM_MSG),
      map(message => message as CommMsgShimMessage)).subscribe(async (message) => {
        if (!this.onClose) return;
        this.onClose(toCommMsg(message));
      });
    this.closeSubscription = messages.pipe(
      filter(message => message.type === SHIM_MESSAGE_TYPE.COMM_CLOSE),
      map(message => message as CommCloseShimMessage)).subscribe(async (message) => {
        if (!this.onMsg) return;
        this.onMsg(toCommMsg(message));
      });
  }

  readonly isDisposed: boolean = false;
  dispose() {}
  
  get commId(): string {
    return this._commId;
  }

  get targetName(): string {
    return this._targetName;
  }

  onClose: (msg: KernelMessage.ICommCloseMsg) => void | PromiseLike<void>;
  onMsg: (msg: KernelMessage.ICommMsgMsg) => void | PromiseLike<void>;

  open(
    data?: JSONValue,
    metadata?: JSONObject,
    buffers?: (ArrayBuffer | ArrayBufferView)[]
  ): Kernel.IFuture {
    const request: CommOpenShimMessage = {
      ...createMessage(SHIM_MESSAGE_TYPE.COMM_OPEN),
      commId: this.commId,
      data: data as object,
      targetModule: 'unknown',
      targetName: this.targetName,
    };
    this.messages.next(request);
    return new MsgFuture();
  }

  send(
    data: JSONValue,
    metadata?: JSONObject,
    buffers?: (ArrayBuffer | ArrayBufferView)[],
    disposeOnDone?: boolean
  ): Kernel.IFuture {
    const request: CommMsgShimMessage = {
      ...createMessage(SHIM_MESSAGE_TYPE.COMM_MSG),
      commId: this.commId,
      data: data as object,
    };
    this.messages.next(request);
    return new MsgFuture();
  }

  close(
    data?: JSONValue,
    metadata?: JSONObject,
    buffers?: (ArrayBuffer | ArrayBufferView)[]
  ): Kernel.IFuture {
    const request: CommMsgShimMessage = {
      ...createMessage(SHIM_MESSAGE_TYPE.COMM_CLOSE),
      commId: this.commId,
      data: data as object,
    };
    this.messages.next(request);
    return new MsgFuture();
  }
}
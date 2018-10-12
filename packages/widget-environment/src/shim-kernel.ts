import { Kernel, KernelMessage } from "@jupyterlab/services";
import { JSONObject, ReadonlyJSONObject, ReadonlyJSONValue, JSONValue } from "@phosphor/coreutils";
import { MockKernel } from "./mock-kernel";
import { Subject, Subscription, Observable, BehaviorSubject, from } from "rxjs";
import { ShimMessage, RequestCommInfoShimMessage, SHIM_MESSAGE_TYPE, createMessage, CommInfoShimMessage, CommOpenShimMessage, toCommOpenMsg } from "./shim-message";
import { filter, first, map } from "rxjs/operators";
import { ShimComm } from "./shim-comm";

type CommCallback = (
  comm: Kernel.IComm,
  msg: KernelMessage.ICommOpenMsg
) => void | PromiseLike<void>;

export class ShimKernel extends MockKernel {
  private messages: Subject<ShimMessage>;
  private openSubscription: Subscription;
  private commTargets: {[targetName: string]: CommCallback[]} = {};

  dispose() {
    super.dispose();
    this.openSubscription.unsubscribe();
  }

  constructor(messages: Subject<ShimMessage>) {
    super();
    this.messages = messages;

    // Listen for comm open messages. Open comms using the registered comm targets.
    this.openSubscription = messages.pipe(
      filter(message => message.type === SHIM_MESSAGE_TYPE.RENDER),
      map(message => message as CommOpenShimMessage)).subscribe(async (message) => {
        const comm = new ShimComm(message.targetName, message.commId, messages);
        if (!this.commTargets[message.targetName]) return;
        await Promise.all(this.commTargets[message.targetName].map(callback => callback(
          comm, toCommOpenMsg(message))));
      });
  }

  /** @override */
  async requestCommInfo(
    content: KernelMessage.ICommInfoRequest
  ): Promise<KernelMessage.ICommInfoReplyMsg> {
    const request: RequestCommInfoShimMessage = {
      ...createMessage(SHIM_MESSAGE_TYPE.REQUEST_COMM_INFO),
      target: content.target,
    };
    this.messages.next(request);
    const reply: CommInfoShimMessage = await this.messages.pipe(
        filter(message => message.parentId === request.id),
        filter(message => message.type === SHIM_MESSAGE_TYPE.COMM_INFO),
        first()).toPromise() as CommInfoShimMessage;
    return {
      content: reply.content as any,
      channel: reply.channel as any,
      header: null, // kernel.iheader
      parent_header: null, // kernel.iheader
      metadata: reply.metadata as JSONObject,
    };
  }

  /** @override */
  connectToComm(targetName: string, commId?: string): Kernel.IComm {
    return new ShimComm(targetName, commId, this.messages);
  }

  /** @override */
  registerCommTarget(targetName: string, callback: CommCallback): void {
    if (!this.commTargets[targetName]) {
      this.commTargets[targetName] = [];
    }
    this.commTargets[targetName].push(callback);
  }

  /** @override */
  removeCommTarget(targetName: string, callback: CommCallback): void {
    if (!this.commTargets[targetName]) return;
    this.commTargets[targetName] = this.commTargets[targetName].filter(
        registeredCallback => registeredCallback === callback);
  }
}
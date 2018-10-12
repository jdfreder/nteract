/* @flow */

import type { ShimMessage, RenderShimMessage } from "./shim-message";

import innerShim from "@nteract/widget-environment/dist/index.html";
// const innerShim ='hello world.';

import { Observable, Subject, Subscription } from "rxjs";
import { createMessage, ofMessageType, childOf } from "@nteract/messaging";
import { filter, map } from "rxjs/operators";

export class OuterShim {
  iframe: HTMLElement;
  commMsgSubscriptions: any[];
  shimMessages: Subject<ShimMessage>;
  shimMessagesSubscription: Subscription;
  modelId: string;

  constructor() {
    this.commMsgSubscriptions = [];
    this.iframe = window.document.createElement("iframe");
    this.iframe.setAttribute("sandbox", "allow-scripts");
    this.iframe.setAttribute("srcdoc", innerShim);

    const messageEventObservable: Observable<MessageEvent> = Observable.fromEvent(window, "message");
    const postMessageObservable: Observable<
      ShimMessage
    > = messageEventObservable.pipe(
      filter(event => {
        if (!event.data) {
          return false;
        }
        console.log("(O) inner -> outer ", event.data);
        return true;
      }),
      map(event => event.data));
    this.shimMessagesSubscription = postMessageObservable.subscribe(
        this.handleShimMessage.bind(this));
  }

  handleShimMessage(msg: ShimMessage) {
    if (msg.type = 'alive') {
      console.log('alive sent');
      this.postMessage(({
        data: {model_id: this.modelId},
        metadata: {},
        mimetype: 'application/vnd.jupyter.widget-view+json',
        type: 'render',
        parentId: msg.id,
        id: 'asdfasdf',
      }: RenderShimMessage));
    }
  }

  dispose() {
    this.unsubscribe();
    this.iframe.remove();
  }

  unsubscribe() {
    if (this.commMsgSubscriptions) {
      this.commMsgSubscriptions.forEach(subscription => subscription.unsubscribe());
      this.commMsgSubscriptions = [];
    }
  }

  getView(): HTMLElement {
    return this.iframe;
  }

  postMessage(msg: any) {
    if (!(this.iframe && (this.iframe: any).contentWindow)) return;
    console.log("(O) outer -> inner ", msg);
    (this.iframe: any).contentWindow.postMessage(msg, '*');
  }

  handleCommMsg(msg: any) {
    this.postMessage({
      type: "comm_msg",
      data: msg.content.data,
      commId: msg.content.comm_id,
      id: msg.msg_id,
      parentId: msg.parent_header.msg_id,
     });
  }

  handleCommOpen(msg: any) {
    this.postMessage({
      type: "comm_open",
      data: msg.content.data,
      commId: msg.content.comm_id,
      id: msg.msg_id,
      parentId: msg.parent_header.msg_id,
      targetModule: msg.content.target_module,
      targetName: msg.content.target_name,
     });
  }

  handleCommClose(msg: any) {
    this.postMessage({
      type: "comm_close",
      data: msg.content.data,
      commId: msg.content.comm_id,
      id: msg.msg_id,
      parentId: msg.parent_header.msg_id,
     });
  }

  subscribe<T>(observable: Observable<T>, handler: (element: T) => void) {
    this.commMsgSubscriptions.push(observable.subscribe(handler.bind(this)));
  }

  setCommMsgsSubject(commMsgs: Subject<any>) {
    console.log('setting comm msg subject,', commMsgs);
    this.unsubscribe();
    this.subscribe(
      commMsgs.pipe(ofMessageType("comm_msg")), this.handleCommMsg);
    this.subscribe(
      commMsgs.pipe(ofMessageType("comm_open")), this.handleCommOpen);
    this.subscribe(
      commMsgs.pipe(ofMessageType("comm_close")), this.handleCommClose);
  }

  setModelId(modelId: string) {
    this.modelId = modelId;
  }
}

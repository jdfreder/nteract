import { KernelMessage } from "@jupyterlab/services";
import { JSONValue } from "@phosphor/coreutils";

export enum SHIM_MESSAGE_TYPE {
  REQUEST_COMM_INFO = 'request_comm_info',
  COMM_INFO = 'comm_info',
  COMM_OPEN = 'comm_open',
  COMM_CLOSE = 'comm_close',
  COMM_MSG = 'comm_msg',
  RESIZE_SELF = 'resize_self',
  RENDER = 'render',
  ALIVE = 'alive',
}

export interface ShimMessage {
  type: SHIM_MESSAGE_TYPE,
  // A number is sufficient enough to avoid collisions.
  id: string,
  parentId: string,
}

export interface RequestCommInfoShimMessage extends ShimMessage {
  target: string,
}

export interface CommInfoShimMessage extends ShimMessage {
  channel: string,
  content: object,
  metadata: object,
}

export interface CommMsgShimMessage extends ShimMessage {
  commId: string,
  data: object,
}

export interface CommCloseShimMessage extends ShimMessage {
  commId: string,
  data: object,
}

export interface CommOpenShimMessage extends ShimMessage {
  commId: string,
  data: object,
  targetModule: string,
  targetName: string,
}

export interface ResizeShimMessage extends ShimMessage {
  width: number,
  height: number,
}

export interface RenderShimMessage extends ShimMessage {
  data: object,
  metadata: object,
  mimetype: string,
}

export function createMessage(type: SHIM_MESSAGE_TYPE, parentId: string = ''): ShimMessage {
  return {type, id: Math.random().toString(16), parentId};
}

export function toCommOpenMsg(message: CommOpenShimMessage): KernelMessage.ICommOpenMsg {
  return {
    content: {
      comm_id: message.commId,
      data: message.data as JSONValue,
      target_name: message.targetName,
      target_module: message.targetModule,
    },
    channel: 'iopub',
    header: null, // iheader
    parent_header: null, // iheader
    metadata: {},
  };
}

export function toCommMsg(message: CommMsgShimMessage): KernelMessage.ICommMsgMsg {
  return {
    content: {
      comm_id: message.commId,
      data: message.data as JSONValue,
    },
    channel: 'iopub',
    header: null, // iheader
    parent_header: null, // iheader
    metadata: {},
  };
}

export function toCommCloseMsg(message: CommCloseShimMessage): KernelMessage.ICommCloseMsg {
  return {
    content: {
      comm_id: message.commId,
      data: message.data as JSONValue,
    },
    channel: 'iopub',
    header: null, // iheader
    parent_header: null, // iheader
    metadata: {},
  };
}
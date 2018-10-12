/* @flow */

export type RequestCommInfoShimMessage = ShimMessage & {
  type: "request_comm_info",
  target: string
};

export type CommInfoShimMessage = ShimMessage & {
  type: "comm_info",
  channel: string,
  content: any,
  metadata: any
};

export type CommMsgShimMessage = ShimMessage & {
  type: "comm_msg",
  commId: string,
  data: any
};

export type CommCloseShimMessage = ShimMessage & {
  type: "comm_close",
  commId: string,
  data: any
};

export type CommOpenShimMessage = ShimMessage & {
  type: "comm_open",
  commId: string,
  data: any,
  targetModule: string,
  targetName: string
};

export type ResizeShimMessage = ShimMessage & {
  type: "resize_self",
  width: number,
  height: number
};

export type RenderShimMessage = ShimMessage & {
  type: "render",
  data: any,
  metadata: any,
  mimetype: string
};

export type ShimMessage = (
  | RequestCommInfoShimMessage
  | CommInfoShimMessage
  | CommMsgShimMessage
  | CommCloseShimMessage
  | CommOpenShimMessage
  | ResizeShimMessage
  | RenderShimMessage
) & {
  id: string,
  parentId: string
};

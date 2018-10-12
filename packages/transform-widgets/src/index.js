/* @flow */
import React from "react";
import { OuterShim } from "./outer-shim";

import type {
  ContentRef,
  AppState,
  KernelRecord,
  RemoteKernelProps,
  LocalKernelProps
} from "@nteract/core";
import { actions, selectors } from "@nteract/core";
import { connect } from "react-redux";

type Props = {
  data: { model_id: string },
  currentKernel: LocalKernelProps | RemoteKernelProps
};

export class PureWidgetDisplay extends React.Component<Props, null> {
  static MIMETYPE = "application/vnd.jupyter.widget-view+json";
  container: { current: null | HTMLDivElement };
  shim: OuterShim;

  constructor(props: Props) {
    super(props);
    this.container = React.createRef();
  }

  componentDidMount() {
    if (!this.container.current) return;
    const view = this.shim.getView();
    this.container.current.appendChild(view);
  }

  componentWillUnmount() {
    if (this.shim) this.shim.dispose();
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    // Only update if the model_id or kernel_id have changed.
    if (nextProps.data.model_id !== this.props.data.model_id) {
      return true;
    }

    if (
      nextProps.currentKernel.id &&
      this.props.currentKernel.id &&
      nextProps.currentKernel.id !== this.props.currentKernel.id
    ) {
      return true;
    }

    return false;
  }

  render(): ?React$Element<any> {
    this.createOrUpdateShim();

    return (
      <pre>
        Widget {this.props.data.model_id}:<div ref={this.container} />
      </pre>
    );
  }

  createOrUpdateShim() {
    if (!this.shim) {
      this.shim = new OuterShim();
    }
    this.shim.setCommMsgsSubject(this.props.currentKernel.channels);
    this.shim.setModelId(this.props.data.model_id);
  }
}
const mapStateToProps = (
  state: AppState,
  { contentRef }: { contentRef: ContentRef }
) => {
  return {
    currentKernel: selectors.currentKernel(state)
  };
};

export const WidgetDisplay = connect(
  mapStateToProps,
  () => ({})
)(PureWidgetDisplay);

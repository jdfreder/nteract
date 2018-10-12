import { ClientSession } from "@jupyterlab/apputils";
import { Kernel, SessionManager } from "@jupyterlab/services";

export class KernelSession extends ClientSession {
  private _kernel: Kernel.IKernelConnection;
  // private _kernelChangedCb: () => {};

  constructor(kernel: Kernel.IKernelConnection, manager: SessionManager) {
    super({manager});
    this._kernel = kernel;
    // this._kernelChangedCb = null;
  }

  // invokeKernelChanged() {
  //   this._kernelChangedCb();
  // }

  // kernelChanged = {
  //   connect(cb: any): boolean { 
  //     this._kernelChangedCb = cb;
  //     return true; 
  //   },
  //   disconnect(cb: any): any {},
  // }

  /** @override */
  get kernel(): Kernel.IKernelConnection {
    return this._kernel;
  }
}
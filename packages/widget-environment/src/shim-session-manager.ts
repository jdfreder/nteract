import { Session, SessionManager, Kernel, ServerConnection } from "@jupyterlab/services";
import { Signal, ISignal } from "@phosphor/signaling";
import { IIterator, iter } from "@phosphor/algorithm";

export class ShimSessionManager implements Session.IManager {
/**
   * Construct a new session manager.
   *
   * @param options - The default options for each session.
   */
  constructor(options: SessionManager.IOptions = {}) {
    this.serverSettings =
      options.serverSettings || ServerConnection.makeSettings();
  }

  /**
   * A signal emitted when the kernel specs change.
   */
  get specsChanged(): ISignal<this, Kernel.ISpecModels> {
    return this._specsChanged;
  }

  /**
   * A signal emitted when the running sessions change.
   */
  get runningChanged(): ISignal<this, Session.IModel[]> {
    return this._runningChanged;
  }

  /**
   * Test whether the manager is disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * The server settings of the manager.
   */
  readonly serverSettings: ServerConnection.ISettings;

  /**
   * Get the most recently fetched kernel specs.
   */
  get specs(): Kernel.ISpecModels | null {
    return null;
  }

  /**
   * Test whether the manager is ready.
   */
  get isReady(): boolean {
    return true;
  }

  /**
   * A promise that fulfills when the manager is ready.
   */
  get ready(): Promise<void> {
    return Promise.resolve()
  }

  /**
   * Dispose of the resources used by the manager.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._isDisposed = true;
    clearInterval(this._modelsTimer);
    clearInterval(this._specsTimer);
    Signal.clearData(this);
    this._models.length = 0;
  }

  /**
   * Create an iterator over the most recent running sessions.
   *
   * @returns A new iterator over the running sessions.
   */
  running(): IIterator<Session.IModel> {
    return iter(this._models);
  }

  /**
   * Force a refresh of the specs from the server.
   *
   * @returns A promise that resolves when the specs are fetched.
   *
   * #### Notes
   * This is intended to be called only in response to a user action,
   * since the manager maintains its internal state.
   */
  refreshSpecs(): Promise<void> {
    return Promise.resolve()
  }

  /**
   * Force a refresh of the running sessions.
   *
   * @returns A promise that with the list of running sessions.
   *
   * #### Notes
   * This is not typically meant to be called by the user, since the
   * manager maintains its own internal state.
   */
  refreshRunning(): Promise<void> {
    return Promise.resolve()
  }

  /**
   * Start a new session.  See also [[startNewSession]].
   *
   * @param options - Overrides for the default options, must include a
   *   `'path'`.
   */
  startNew(options: Session.IOptions): Promise<Session.ISession> {
    let serverSettings = this.serverSettings;
    return Session.startNew({ ...options, serverSettings }).then(session => {
      return session;
    });
  }

  /**
   * Find a session associated with a path and stop it if it is the only session
   * using that kernel.
   *
   * @param path - The path in question.
   *
   * @returns A promise that resolves when the relevant sessions are stopped.
   */
  stopIfNeeded(path: string): Promise<void> {
    return Session.listRunning(this.serverSettings)
      .then(sessions => {
        const matches = sessions.filter(value => value.path === path);
        if (matches.length === 1) {
          const id = matches[0].id;
          return this.shutdown(id).catch(() => {
            /* no-op */
          });
        }
      })
      .catch(() => Promise.resolve(void 0)); // Always succeed.
  }

  /**
   * Find a session by id.
   */
  findById(id: string): Promise<Session.IModel> {
    return Session.findById(id, this.serverSettings);
  }

  /**
   * Find a session by path.
   */
  findByPath(path: string): Promise<Session.IModel> {
    return Session.findByPath(path, this.serverSettings);
  }

  /*
   * Connect to a running session.  See also [[connectToSession]].
   */
  connectTo(model: Session.IModel): Session.ISession {
    const session = Session.connectTo(model, this.serverSettings);
    return session;
  }

  /**
   * Shut down a session by id.
   */
  shutdown(id: string): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Shut down all sessions.
   *
   * @returns A promise that resolves when all of the sessions are shut down.
   */
  async shutdownAll(): Promise<void> {
    return Promise.resolve();
  }


  private _isDisposed = false;
  private _models: Session.IModel[] = [];
  private _modelsTimer = -1;
  private _specsTimer = -1;
  private _specsChanged = new Signal<this, Kernel.ISpecModels>(this);
  private _runningChanged = new Signal<this, Session.IModel[]>(this);
}
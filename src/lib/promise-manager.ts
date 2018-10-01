export type DelayFunc = ((maxRetries: number, retries: number) => number)
export type PromiseRetriever<T> = () => Promise<T>;
export type ID = number | string
export type ErrorWhitelist = (error: any) => boolean;

export type Config = {
  retries: number;
  delay: number | DelayFunc;
  errorWhitelist: ErrorWhitelist;
}

interface MetaData {
  canceled?: boolean;
  timeout?: number;
  starttime?: number;
  resolve?: any;
}

export default class PromiseManager {

  private retries: number = 10;
  private delay: number | DelayFunc = 1000;
  private taskMeta: Map<number | string, MetaData> = new Map();
  private errorWhitelist: ErrorWhitelist = err => true;
  public log: boolean = true;


  /**
   * 
   * @param retries Number of retries, default is 10
   * @param delay the delay in ms as a Number or DelayFunc, Default is 1000
   * @param errorWhitelist a function that allows retrying only the whitelisted error. 
   */

  constructor(retries?: number, delay?: number | DelayFunc, errorWhitelist?: ErrorWhitelist) {
    if (retries !== undefined) this.retries = retries;
    if (delay !== undefined) this.delay = delay;
    if (errorWhitelist !== undefined) this.errorWhitelist = errorWhitelist;
    this.insist = this.insist.bind(this)
    this.cancel = this.cancel.bind(this)
  }

  /**
   * 
   * @param id the id associated with the retryable promise/task
   */

  public async cancel(id) {
    if (!this.taskMeta.has(id)) return false;
    const meta = this.taskMeta.get(id)
    if (meta === undefined || !('timeout' in meta)) return false;
    this.taskMeta.set(id, { ...meta, canceled: true })
    clearTimeout(meta.timeout)
    meta.resolve()
    return true;
  }

  /**
   * Insist on resolving the promise via x tries
   * @param id ID of the promise/task
   * @param promiseRetriever A function that when executed returns a promise
   * @param config Optional configuration , if not specified the config passed in the constructor will be used, if that latter wasn't specified either, the default will be used .
   */

  public async insist<T>(id: ID, promiseRetriever: PromiseRetriever<T>, config: Config = { retries: this.retries, delay: this.delay, errorWhitelist: this.errorWhitelist }): Promise<T> {
    if (this.taskMeta.has(id)) throw new Error('Promise already pending')
    this.taskMeta.set(id, { canceled: false, starttime: Date.now() })
    return this._insist<T>(id, promiseRetriever, config, config.retries)
  }

  private async _insist<T>(id: ID, promiseRetriever: PromiseRetriever<T>, config: Config, maxRetries: number): Promise<T> {
    try {
      const result = await promiseRetriever();
      this.taskMeta.delete(id)
      return result;
    } catch (err) {
      const metaData = this.taskMeta.get(id) as MetaData;
      delete metaData.timeout
      if (!config.errorWhitelist(err) || config.retries === 1 || metaData.canceled) {
        if (this.log && metaData.canceled) console.log(`Canceled task of ID : ${id} (~ ${Date.now() - (metaData.starttime || 0)} ms)`)
        this.taskMeta.delete(id)
        throw new Error(err)
      }

      let delay = config.delay;
      if (typeof delay === 'function') {
        delay = delay(maxRetries, config.retries)
      }
      if (this.log) console.log(`Retrying ${id} after ${delay} ms`)
      config.retries -= 1
      return new Promise<T>(resolve => metaData.timeout = setTimeout(metaData.resolve = () => resolve(this._insist<T>(id, promiseRetriever, config, maxRetries)), delay as number))
    }
  }
}

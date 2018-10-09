import { v4 } from 'uuid';

export type DelayFunc = ((maxRetries: number, retries: number) => number);
export type TaskRetriever<T> = () => Promise<T>;
export type ID = number | string;
export type ErrorFilter = (error: any) => boolean;
export type CancelResolver = (any) => any;
export type RetryCallback = ((attempts: number, timeConsumed: number) => void) | null | undefined;

export type Config = {
    retries?: number;
    delay?: number | DelayFunc;
    errorFilter?: ErrorFilter;
};

interface MetaData {
    task?: TaskRetriever<any>;
    canceled?: boolean;
    cancelResolver?: CancelResolver;
    timeout?: any;
    starttime?: number;
    onRetry?: RetryCallback;
    resolve?;
}

export class Insist<T> implements Promise<T> {
    private _promise: Promise<T>;
    private _id;

    constructor(id: ID, promise: Promise<T>) {
        this._id = id;
        this._promise = promise;
    }

    public getID() {
        return this._id;
    }

    public then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) =>
            TResult1 | PromiseLike<TResult1>) | undefined | null,
        onrejected?: ((reason: any) =>
            TResult2 | PromiseLike<TResult2>) | undefined | null
    ): Promise<TResult1 | TResult2> {
        return this._promise.then(onfulfilled, onrejected);
    }

    public catch<TResult = never>(
        onrejected?: ((reason: any) =>
            TResult | PromiseLike<TResult>) | undefined | null
    ): Promise<T | TResult> {
        return this._promise.then(onrejected);
    }

    public [Symbol.toStringTag]: 'Promise';
}

export default class PromiseInsist {

    //global config per instance.
    private globalConfig: Config = {
        retries: 10,
        delay: 1000,
        errorFilter: err => true
    };

    private taskMeta: Map<number | string, MetaData> = new Map();
    private verbose: boolean = false;

    /**
     *
     * @param retries Number of retries, default is 10
     * @param delay the delay in ms as a Number or DelayFunc, Default is 1000
     * @param errorFilter a function that allows retrying only the whitelisted error.
     */

    constructor(config?: Config) {
        if (config !== undefined) {
            const { retries, delay, errorFilter } = config;
            if (retries !== undefined) { this.globalConfig.retries = retries; }
            if (delay !== undefined) { this.globalConfig.delay = delay; }
            if (errorFilter !== undefined) { this.globalConfig.errorFilter = errorFilter; }
        }
        this.setVerbose = this.setVerbose.bind(this);
        this.insist = this.insist.bind(this);
        this.cancelInsist = this.cancelInsist.bind(this);
        this.cancelAllInsists = this.cancelAllInsists.bind(this);
        this.replaceTask = this.replaceTask.bind(this);
        this.setRetryHook = this.setRetryHook.bind(this);
    }

    public setVerbose(verbose: boolean) {
        this.verbose = verbose;
        return this;
    }
    /**
     *
     * @param ids the ids associated with the retryable promises/tasks
     */

    public async cancelInsist<T>(...insists: (Insist<T> | ID)[]) {
        insists.forEach(async (insist) => {
            const id = insist instanceof Insist ? insist.getID() : insist;
            await new Promise(async (resolve) => {
                const meta = this.taskMeta.get(id);
                if (meta === undefined ||
                    !('timeout' in meta) ||
                    meta.canceled === true
                ) {
                    resolve();
                } else {
                    clearTimeout(meta.timeout);
                    this.taskMeta.set(id, { ...meta, canceled: true, cancelResolver: resolve });
                    meta.resolve();
                }
            });
        });
        return this;
    }

    public async cancelAllInsists() {
        return this.cancelInsist(...Array.from(this.taskMeta.keys()));
    }

    /**
     * Insists on resolving the promise via x tries
     * @param id ID of the promise/task
     * @param promiseRetriever A function that when executed returns a promise
     * @param config
     * Optional configuration , if not specified the config passed in the constructor will be used,
     * if that latter wasn't specified either, the default will be used .
     */

    public insist<T>(
        taskRetriever: TaskRetriever<T>,
        retryHook?: RetryCallback,
        config: Config = this.globalConfig
    ): Insist<T> {
        const _config = { ...this.globalConfig, ...config };
        const uuid = v4();
        this.taskMeta.set(uuid, { canceled: false, starttime: Date.now(), onRetry: retryHook });
        return new Insist(uuid, this._insist<T>(uuid, taskRetriever, _config, _config.retries!));
    }

    public replaceTask<T>(insist: Insist<T>, taskRetriever: TaskRetriever<T>): Promise<void> {
        const meta = this.taskMeta.get(insist.getID());
        if (meta !== undefined) {
            meta.task = taskRetriever;
        }
        return Promise.resolve();
    }
    public async setRetryHook<T>(id: ID, callback: RetryCallback): Promise<void> {
        const meta = this.taskMeta.get(id);
        if (meta !== undefined) {
            meta.onRetry = callback;
        }
        return Promise.resolve();
    }

    private async _insist<T>(
        id: ID,
        taskRetriever: TaskRetriever<T>,
        config: Config,
        maxRetries: number
    ): Promise<T> {

        const taskStarttime = Date.now();
        try {
            const result = await taskRetriever();
            this.taskMeta.delete(id);
            return result;
        } catch (err) {
            const metaData = <MetaData>this.taskMeta.get(id);
            //required in case promise was revoked twice after cancel()
            if (metaData === undefined) {
                return Promise.resolve(err);
            }
            delete metaData.timeout;

            if (!config.errorFilter!(err) ||
                config.retries === 0 ||
                metaData.canceled
            ) {
                if (this.verbose && metaData.canceled) {
                    console.log(`Canceled task of ID : ${id} (~ ${Date.now() - (metaData.starttime || 0)} ms)`);
                }
                this.taskMeta.delete(id);
                if (typeof metaData.cancelResolver === 'function') {
                    metaData.cancelResolver({ id, time: Date.now() - (metaData.starttime || 0) });
                }
                return Promise.reject(err);
            }
            let delay = config.delay;
            if (typeof delay === 'function') {
                delay = delay(maxRetries, config.retries!);
            }
            if (metaData.onRetry) {
                metaData.onRetry(config.retries! - 1, Math.max(taskStarttime - Date.now(), 0));
            }
            if (this.verbose) {
                console.log(`Retrying ${id} after ${delay} ms`);
            }
            config.retries! -= 1;

            return new Promise<T>(
                resolve => {
                    metaData.resolve = () => resolve(this._insist<T>
                        (
                        id, (metaData.task ? metaData.task : taskRetriever),
                        config, maxRetries
                        ));
                    metaData.timeout = setTimeout(
                        metaData.resolve,
                        <number>delay
                    );
                });
        }
    }

}

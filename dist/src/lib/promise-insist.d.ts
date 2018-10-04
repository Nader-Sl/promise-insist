export declare type DelayFunc = ((maxRetries: number, retries: number) => number);
export declare type TaskRetriever<T> = () => Promise<T>;
export declare type ID = number | string;
export declare type ErrorFilter = (error: any) => boolean;
export declare type CancelResolver = (any: any) => any;
export declare type RetryCallback = ((attempts: number, timeConsumed: number) => void) | null | undefined;
export declare type Config = {
    retries?: number;
    delay?: number | DelayFunc;
    errorFilter?: ErrorFilter;
};
export default class PromiseInsist {
    private globalConfig;
    private taskMeta;
    verbose: boolean;
    /**
     *
     * @param retries Number of retries, default is 10
     * @param delay the delay in ms as a Number or DelayFunc, Default is 1000
     * @param errorFilter a function that allows retrying only the whitelisted error.
     */
    constructor(config?: Config);
    /**
     *
     * @param id the id associated with the retryable promise/task
     */
    cancel(id: any): Promise<{}>;
    /**
     * Insists on resolving the promise via x tries
     * @param id ID of the promise/task
     * @param promiseRetriever A function that when executed returns a promise
     * @param config
     * Optional configuration , if not specified the config passed in the constructor will be used,
     * if that latter wasn't specified either, the default will be used .
     */
    insist<T>(id: ID, taskRetriever: TaskRetriever<T>, retryHook?: RetryCallback, config?: Config): Promise<T>;
    replaceTask<T>(id: ID, taskRetriever: TaskRetriever<T>): Promise<void>;
    addRetryHook<T>(id: ID, callback: RetryCallback): Promise<void>;
    private _insist;
}

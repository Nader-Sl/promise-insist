import { AxiosError } from 'axios';
export declare function isRetryable(error: AxiosError): boolean;
export declare function isNetError(error: AxiosError): boolean;
export declare function isServerError(error: AxiosError): boolean;
export declare function isIdempotent(error: AxiosError): boolean;
export declare function isSafe(error: AxiosError): boolean;
export default isRetryable;

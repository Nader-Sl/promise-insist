import { AxiosError } from 'axios';
const RETRYABLE_ERRORS = [
    'ETIMEDOUT',
    'ECONNRESET',
    'EADDRINUSE',
    'ESOCKETTIMEDOUT',
    'ECONNREFUSED',
    'EPIPE'
];

const SAFE_HTTP_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const IDEMPOTENT_HTTP_METHODS = SAFE_HTTP_METHODS.concat(['PUT', 'DELETE']);

export function isRetryable(error: AxiosError) {
    if (error.code === undefined) {
        return false;
    }
    return RETRYABLE_ERRORS.indexOf(error.code) !== -1;
}

export function isNetError(error: AxiosError) {
    return (
        error.response === undefined &&
        isRetryable(error)
    );
}

export function isServerError(error: AxiosError) {
    return (
        error.response !== undefined &&
        error.response.status >= 500 &&
        error.response.status <= 600 &&
        isRetryable(error)
    );
}

export function isIdempotent(error: AxiosError) {
    return (
        error.config !== undefined &&
        error.config.method !== undefined &&
        isRetryable(error) &&
        IDEMPOTENT_HTTP_METHODS.indexOf(error.config.method) !== -1
    );
}
export function isSafe(error: AxiosError) {
    return (
        error.config !== undefined &&
        error.config.method !== undefined &&
        isRetryable(error) &&
        SAFE_HTTP_METHODS.indexOf(error.config.method) !== -1
    );
}

export default isRetryable;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RETRYABLE_ERRORS = [
    'ETIMEDOUT',
    'ECONNRESET',
    'EADDRINUSE',
    'ESOCKETTIMEDOUT',
    'ECONNREFUSED',
    'EPIPE'
];
var SAFE_HTTP_METHODS = ['GET', 'HEAD', 'OPTIONS'];
var IDEMPOTENT_HTTP_METHODS = SAFE_HTTP_METHODS.concat(['PUT', 'DELETE']);
function isRetryable(error) {
    if (error.code === undefined) {
        return false;
    }
    return RETRYABLE_ERRORS.indexOf(error.code) !== -1;
}
exports.isRetryable = isRetryable;
function isNetError(error) {
    return (error.response === undefined &&
        isRetryable(error));
}
exports.isNetError = isNetError;
function isServerError(error) {
    return (error.response !== undefined &&
        error.response.status >= 500 &&
        error.response.status <= 600 &&
        isRetryable(error));
}
exports.isServerError = isServerError;
function isIdempotent(error) {
    return (error.config !== undefined &&
        error.config.method !== undefined &&
        isRetryable(error) &&
        IDEMPOTENT_HTTP_METHODS.indexOf(error.config.method) !== -1);
}
exports.isIdempotent = isIdempotent;
function isSafe(error) {
    return (error.config !== undefined &&
        error.config.method !== undefined &&
        isRetryable(error) &&
        SAFE_HTTP_METHODS.indexOf(error.config.method) !== -1);
}
exports.isSafe = isSafe;
exports.default = isRetryable;
//# sourceMappingURL=index.js.map
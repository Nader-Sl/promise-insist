"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExponentialDelay = function (baseDelay) {
    if (baseDelay === void 0) { baseDelay = 1000; }
    return function (maxRetries, retryNumber) {
        var delay = Math.pow(2, (maxRetries - retryNumber)) * 100;
        var randomSum = delay * 0.2 * Math.random();
        return baseDelay + delay + randomSum;
    };
};
//# sourceMappingURL=delays.js.map
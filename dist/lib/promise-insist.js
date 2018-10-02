"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var PromiseInsist = /** @class */ (function () {
    /**
     *
     * @param retries Number of retries, default is 10
     * @param delay the delay in ms as a Number or DelayFunc, Default is 1000
     * @param errorWhitelist a function that allows retrying only the whitelisted error.
     */
    function PromiseInsist(retries, delay, errorWhitelist) {
        this.retries = 10;
        this.delay = 1000;
        this.taskMeta = new Map();
        this.errorWhitelist = function (err) { return true; };
        this.log = true;
        if (retries !== undefined)
            this.retries = retries;
        if (delay !== undefined)
            this.delay = delay;
        if (errorWhitelist !== undefined)
            this.errorWhitelist = errorWhitelist;
        this.insist = this.insist.bind(this);
        this.cancel = this.cancel.bind(this);
    }
    /**
     *
     * @param id the id associated with the retryable promise/task
     */
    PromiseInsist.prototype.cancel = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var meta = _this.taskMeta.get(id);
                        if (meta === undefined || !('timeout' in meta) || meta.canceled === true)
                            resolve();
                        else {
                            _this.taskMeta.set(id, __assign({}, meta, { canceled: true, cancelResolver: resolve }));
                            clearTimeout(meta.timeout);
                            meta.resolve();
                        }
                    })];
            });
        });
    };
    /**
     * Insists on resolving the promise via x tries
     * @param id ID of the promise/task
     * @param promiseRetriever A function that when executed returns a promise
     * @param config Optional configuration , if not specified the config passed in the constructor will be used, if that latter wasn't specified either, the default will be used .
     */
    PromiseInsist.prototype.insist = function (id, promiseRetriever, config) {
        if (config === void 0) { config = { retries: this.retries, delay: this.delay, errorWhitelist: this.errorWhitelist }; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.taskMeta.has(id))
                    throw new Error('Promise is still pending, if you want to cancel it call cancel(id).');
                this.taskMeta.set(id, { canceled: false, starttime: Date.now() });
                return [2 /*return*/, this._insist(id, promiseRetriever, config, config.retries)];
            });
        });
    };
    PromiseInsist.prototype._insist = function (id, promiseRetriever, config, maxRetries) {
        return __awaiter(this, void 0, void 0, function () {
            var result, err_1, metaData_1, delay_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, promiseRetriever()];
                    case 1:
                        result = _a.sent();
                        this.taskMeta.delete(id);
                        return [2 /*return*/, result];
                    case 2:
                        err_1 = _a.sent();
                        metaData_1 = this.taskMeta.get(id);
                        delete metaData_1.timeout;
                        if (!config.errorWhitelist(err_1) || config.retries === 1 || metaData_1.canceled) {
                            if (this.log && metaData_1.canceled)
                                console.log("Canceled task of ID : " + id + " (~ " + (Date.now() - (metaData_1.starttime || 0)) + " ms)");
                            this.taskMeta.delete(id);
                            if (typeof metaData_1.cancelResolver === 'function')
                                metaData_1.cancelResolver();
                            throw new Error(err_1);
                        }
                        delay_1 = config.delay;
                        if (typeof delay_1 === 'function') {
                            delay_1 = delay_1(maxRetries, config.retries);
                        }
                        if (this.log)
                            console.log("Retrying " + id + " after " + delay_1 + " ms");
                        config.retries -= 1;
                        return [2 /*return*/, new Promise(function (resolve) { return metaData_1.timeout = setTimeout(metaData_1.resolve = function () { return resolve(_this._insist(id, promiseRetriever, config, maxRetries)); }, delay_1); })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return PromiseInsist;
}());
exports.default = PromiseInsist;
//# sourceMappingURL=promise-insist.js.map
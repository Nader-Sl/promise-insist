"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var __1 = __importDefault(require(".."));
var presets_1 = require("../presets");
var axios_1 = __importDefault(require("axios"));
var ExponentialDelay = presets_1.Delays.ExponentialDelay;
//A Preset of Axios error filters.
var _a = presets_1.ErrorFilters.AxiosErrorFilters, isRetryable = _a.isRetryable, isServerError = _a.isServerError, isNetError = _a.isNetError, isSafe = _a.isSafe, isIdempotent = _a.isIdempotent;
var ExampleError = /** @class */ (function (_super) {
    __extends(ExampleError, _super);
    function ExampleError(msg, errorCode) {
        var _this = _super.call(this, msg) || this;
        _this.errorCode = errorCode;
        Object.setPrototypeOf(_this, ExampleError.prototype);
        return _this;
    }
    ExampleError.prototype.getErrorCode = function () {
        return this.errorCode;
    };
    return ExampleError;
}(Error));
//Create an Axios PromiseInsist instance with 20 retries per request , exponential delay and only retry if error is a server error.
var _b = new __1.default({ retries: 20, delay: presets_1.Delays.ExponentialDelay(), errorFilter: isRetryable }), insist = _b.insist, cancel = _b.cancel;
// handles assigned per insisting promise, used to cancel any later.
var t1_ID = 'doSomething';
var t2_ID = 'doSomethingElse';
//Insist on a promise to be resolved within 20 retries, error will be caught if it still fails after that..
insist(t1_ID, function () { return axios_1.default.get('http://localhost:1337'); })
    .then(function (res) { console.log(res); console.log('^ do something with response.'); })
    .catch(function (err) { return console.log(err); });
/**
 * After 3 seconds, cancel any active retry attempts for the earlier request
 * and submit another request with a different url and handler
 */
setTimeout(function () {
    cancel(t1_ID)
        .then(function () { return insist(t2_ID, function () { return axios_1.default.get('http://localhost:1337/important'); }); })
        .then(function (res) {
        console.log(res);
        console.log('^ do something different now.');
    })
        .catch(function (err) { return console.log(err); });
}, 3000);
//# sourceMappingURL=axios.js.map
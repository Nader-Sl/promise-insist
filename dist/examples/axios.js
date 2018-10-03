"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/** Commonjs Import Style (via npm)
 * var PromiseInsist = require('promise-insist').default;
 */
var __1 = __importDefault(require(".."));
var presets_1 = require("../presets");
var axios_1 = __importDefault(require("axios"));
// A preset of Delays error filters.
var ExponentialDelay = presets_1.Delays.ExponentialDelay;
//A Preset of Axios error filters.
var _a = presets_1.ErrorFilters.AxiosErrorFilters, isRetryable = _a.isRetryable, isServerError = _a.isServerError, isNetError = _a.isNetError, isSafe = _a.isSafe, isIdempotent = _a.isIdempotent;
//Create an Axios PromiseInsist instance with 20 retries per request , exponential delay and only retry if error is a server error.
var _b = new __1.default({ retries: 20, delay: ExponentialDelay(), errorFilter: isRetryable }), insist = _b.insist, cancel = _b.cancel;
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
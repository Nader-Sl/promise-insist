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
/** Commonjs Import Style
 * var PromiseInsist = require('promise-insist').default;
 */
var __1 = __importDefault(require(".."));
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
function getRand(min, max) {
    var _min = Math.ceil(min);
    var _max = Math.floor(max);
    return Math.floor(Math.random() * (_max - _min)) + _min;
}
//Call wrapper for re-use
var magicCallwrapper = function () { return new Promise(function (resolve, reject) {
    setTimeout(function () { }, 2000);
    var magicNumber = getRand(1, 10);
    if (magicNumber === 5) {
        resolve(magicNumber);
    }
    else {
        reject(new ExampleError('Random magic number wasn\'t guessed.', 550));
    }
}); };
//Create a PromiseInsist instance with 30 retries and a static delay of 2000
var _a = new __1.default({ retries: 30, delay: 2000 }), insist = _a.insist, cancel = _a.cancel;
// IDs to be assigned per insisting promise.
var t1_ID = 't1', t2_ID = 't2';
//Insist on a promise to be resolved within 30 retries, error will be caught if it still fails after that..
insist(t1_ID, magicCallwrapper)
    .then(function (res) { console.log(t1_ID + " : Magic number " + res + " was guessed!"); })
    .catch(function (err) { return console.log(t1_ID + ": " + err); });
/*re-usable call wrapper for another promise insist function, this time it overrides
 the global delay and retries values as it adds a new error whitelist filter*/
var insist2CallWrapper = function () {
    return insist(t2_ID, magicCallwrapper, { delay: 2000, retries: 10, errorFilter: function (err) { return err.getErrorCode() === 550; } })
        .then(function (res) { console.log(t2_ID + " : Magic number " + res + " was guessed!"); })
        .catch(function (err) { return console.log(t2_ID + " : " + err); });
};
/**
 * Retry cancelation test:
 *
 * After executing the first insisting promise, we wait some random time then cancel
 * the retrying process incase it was still active, then executes the second insisting promise.
 */
setTimeout(function () {
    cancel(t1_ID)
        .then(insist2CallWrapper)
        .catch(function (err) { return console.log(err); });
}, getRand(1000, 3000));
//# sourceMappingURL=general.js.map
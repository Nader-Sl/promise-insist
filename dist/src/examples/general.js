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
var GoodluckError = /** @class */ (function (_super) {
    __extends(GoodluckError, _super);
    function GoodluckError(msg, errorCode) {
        var _this = _super.call(this, msg) || this;
        _this.errorCode = errorCode;
        Object.setPrototypeOf(_this, GoodluckError.prototype);
        return _this;
    }
    GoodluckError.prototype.getErrorCode = function () {
        return this.errorCode;
    };
    return GoodluckError;
}(Error));
function getRand(min, max) {
    var _min = Math.ceil(min);
    var _max = Math.floor(max);
    return Math.floor(Math.random() * (_max - _min)) + _min;
}
//re-usable call wrapper for insisting on getting a random number of value 5
var guessCallwrapper = function (guess) { return function () { return new Promise(function (resolve, reject) {
    setTimeout(function () { }, 2000);
    var magicNumber = getRand(1, 10);
    if (magicNumber === guess) {
        resolve(magicNumber);
    }
    else {
        reject(new GoodluckError('Random magic number wasn\'t guessed.', 777));
    }
}); }; };
/**
 * Create a PromiseInsist instance with an optional config of 30 retries and a static delay of 2000.
 * Default: retries = 10 , delay = 1000
 */
var _a = new __1.default({ retries: 30, delay: 2000 }), insist = _a.insist, cancel = _a.cancel, replaceTask = _a.replaceTask;
// Handles to be assigned per insisting promise.
var t1_ID = 't1', t2_ID = 't2';
/**
 * Insist on guessing 5 to be completed within a max 30 retries, handle error if it still fails after that..
 */
insist(t1_ID, //The handle
guessCallwrapper(5), //The promise wrapper to insist on.
// A retry hook, executed on every attempt, passed in current attempt count and time consumed by the last retry
function (attemptCount, timeConsumed) {
    console.log("Attempt #" + attemptCount + " done in " + timeConsumed + " ms");
})
    .then(function (res) { console.log(t1_ID + " : Magic number " + res + " was guessed!"); })
    .catch(function (err) { return console.log(t1_ID + ": " + err); });
/**
 * Retry cancelation test:
 *
 * After executing the guess 5 insisting promise,let's wait (3,5) seconds, then cancel
 * the retrying process incase it was still active, then insist on guessing another number: 7
 * this time defining a custom configuration per this insist and add a whitelisting error filter
 * tomake sure it only retries if thereturned error code was 777.
 */
setTimeout(function () {
    cancel(t1_ID)
        .then(function () { return insist(t2_ID, guessCallwrapper(7), 
    //no retry hook this time
    null, { delay: 2000, retries: 10, errorFilter: function (err) { return err.getErrorCode() === 777; } }); })
        .then(function (res) { console.log(t2_ID + " : Magic number " + res + " was guessed!"); })
        .catch(function (err) { return console.log(t2_ID + " : " + err); });
}, getRand(3000, 5000));
/**
 * After 4 seconds, replace the task of guessing 7 to yet another task of guessing 3
 * so that in case the current task is still retrying, the replaced task will be swapped
 * while maintaining the retries count. (useful in things like rate-limits etc.)
 */
setTimeout(function () {
    replaceTask(t2_ID, guessCallwrapper(3));
}, 4000);
//# sourceMappingURL=general.js.map
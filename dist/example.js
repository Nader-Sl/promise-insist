"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = __importDefault(require("."));
function getRand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
function exponentialDelay(maxRetries, retryNumber) {
    var baseDelay = 1000;
    var delay = Math.pow(2, (maxRetries - retryNumber)) * 100;
    var randomSum = delay * 0.2 * Math.random();
    return baseDelay + delay + randomSum;
}
var getMagicRandRetriever = function () { return new Promise(function (resolve, reject) {
    var magicNumber = getRand(1, 10);
    if (magicNumber === 5)
        resolve(magicNumber);
    else
        reject('Random magic number wasn\'t guessed.');
}); };
var _a = new _1.default(30, exponentialDelay), insist = _a.insist, cancel = _a.cancel;
var t1_ID = 't1', t2_ID = 't2';
insist(t1_ID, getMagicRandRetriever)
    .then(function (res) { console.log(t1_ID + " : Magic number " + res + " was guessed!"); })
    .catch(function (err) { return console.log(t1_ID + ": " + err); });
insist(t2_ID, getMagicRandRetriever)
    .then(function (res) { console.log(t2_ID + " : Magic number " + res + " was guessed!"); })
    .catch(function (err) { return console.log(t2_ID + " : " + err); });
setTimeout(function () { return cancel(t1_ID); }, 5000);
setTimeout(function () { return cancel(t2_ID); }, 8000);
//# sourceMappingURL=example.js.map
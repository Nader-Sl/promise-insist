# promise-insist
[![NPM version](https://badge.fury.io/js/promise-insist.svg)](https://www.npmjs.com/package/promise-insist) 
[![Travis CI Build](https://travis-ci.org/Nader-Sl/promise-insist.svg?branch=master)](https://travis-ci.org/Nader-Sl/promise-insist) 
[![NPM Documentation](https://img.shields.io/badge/docs-latest-lightgrey.svg)](https://nader-sl.github.io/promise-persist/) 

<br/>
  <h3 align="center">“When someone promises you and doesn’t deliver, you’d better insist.”</h3>
 <br/>

Promise-Insist provides flexible functionality to insist on fullfilling a conditional promise by retrying, cancel-retrying and replacing promises based on error filtering and relational delays.

This is a useful solution for more advanced scenarios when you want to be able to concurrently await many promises and you want to retry each with specific or global configuration and conditions, and you want at any point to be able to cancle retrying a certain task maybe because it collides with another concurrent task of a higher priority.

## Features
* Retry (insist on) a promise **_retries_** times every **_delay_** only if the **_errorFilter_** 
is whitelisted through global or task specific __config__

* Cancle retrying(insisting) at any period of time.

* Set a callback that executes per each retry per task (**_attemptNumber_**, **_timeConsumed_**) => **void**

* Replace a task being retried by another one dynamically while maintaining the current insist configuration
and retries count left (useful with things like rate-limits etc..)

### → Check out my [medium](https://medium.com/@nadersleiman_3234/promise-insist-you-promised-and-i-insist-s-ce989f55bb3b) article for the guide.

##### Npm install
```powershell
npm i promise-insist --save
```

## General Example
```typescript
import PromiseInsist, { CancelError } from 'promise-insist';

function getRand(min, max): number {
  const _min = Math.ceil(min);
  const _max = Math.floor(max);
  return Math.floor(Math.random() * (_max - _min)) + _min;
}

//re-usable call wrapper for insisting on getting a random number of value 5
const guessCallwrapper = (guess: number) => () => new Promise(
  (resolve, reject) => {

    const magicNumber = getRand(1, 10);
    if (magicNumber === guess) {
      resolve(magicNumber);
    } else {
      reject(777);
    }
  });

/**
 * Create a PromiseInsist instance with an optional config of 30 retries and a static delay of 2000.
 * Default: retries = 10 , delay = 1000
 */
const {
  insist,
  cancelInsist,
  cancelAllInsists,
  replaceTask
} = new PromiseInsist({ retries: 30, delay: 2000 });

/**
 * Create an insisting promise to guess #5 to be completed within a max 30 retries,
 * define retry hook to log on each retry then handle error if it still fails after that..
 */
const insist1 = insist(
  guessCallwrapper(5), //The promise wrapper to insist on.
  // A retry hook, executed on every attempt, passed in current attempt count and time consumed by the last retry
  (attemptCount, timeConsumed) => {
    console.log(`Insist1: Attempt #${attemptCount} done in ${timeConsumed} ms`);
  }
);

/**
 * Create an insisting promise to guess #7 to be completed within a max 7 retries,
 * an exponential delay, and error filter to retry on error (777) only.
 */
const insist2 = insist(
  guessCallwrapper(7),
  // A retry hook, executed on every attempt, passed in current attempt count and time consumed by the last retry
  (attemptCount, timeConsumed) => {
    console.log(`Insist2: Attempt #${attemptCount} done in ${timeConsumed} ms`);
  },
  {// Explicitly specify config.
    delay: 2000,
    retries: 10,
    errorFilter: (err) => err === 777
  }
);

async function testInsist1() {
  try {
    const res = await insist1;
    console.log(`Insist1 : Magic number ${res} was guessed!`);
  } catch (err) {
    console.log(
      `Error[Insist1]: ${err instanceof CancelError ?
        'Task has been Canceled!' :
        `Magic number wasn't guessed.. : ${err}`}`
    );
  }
}

testInsist1();

/**
 * Retry cancelation test:
 *
 * After executing the guess 5 insisting promise,let's wait (3,5) seconds, then cancel
 * the retrying process incase it was still active, then insist on guessing another number: 7
 * this time defining a custom configuration per this insist and add a whitelisting error filter
 * to make sure it only retries if thereturned error code was 777.
 */

async function testInsist2() {
  setTimeout(
    async () => {
      try {
        await cancelInsist(insist1);
        const res = await insist2;
        console.log(`Insist2 : Magic number ${res} was guessed!`);
      } catch (err) { console.log(`Insist2: Magic number wasn't guessed.. :${err}`); }
    },
    getRand(3000, 4000));
}

testInsist2();

```
## Example Output

```powershell
Insist1: Attempt #29 done in 0 ms
Insist2: Attempt #9 done in 0 ms
Insist1: Attempt #28 done in 0 ms
Insist2: Attempt #8 done in 0 ms
Error[Insist1]: Task has been Canceled!
Insist2: Attempt #7 done in 0 ms
Insist2: Attempt #6 done in 0 ms
Insist2: Attempt #5 done in 0 ms
Insist2 : Magic number 7 was guessed!
```
___
#### You can also choose a preset for the **Delay** and **ErrorFilter** (you can write yours and submit a PR).
## Axios Example:
```typescript
import PromiseInsist, { Delays, ErrorFilters } from 'promise-insist';
import axios from 'axios';

// A preset of Delays error filters.
const { ExponentialDelay } = Delays;
//A Preset of Axios error filters.
const { isRetryable, isServerError, isNetError, isSafe, isIdempotent } = ErrorFilters.AxiosErrorFilters;

//Create an Axios PromiseInsist instance with 20 retries per request , exponential delay and only retry if error is a server error.
const {
  insist,
  cancelInsist
} = new PromiseInsist({ retries: 20, delay: ExponentialDelay(), errorFilter: (isRetryable) }).setVerbose(true);

const insistGET1 = insist(
  () => axios.get('http://localhost:1337'),
  (attemptCount, timeConsumed) => { console.log(`Attempt #${attemptCount} done in ${timeConsumed} ms`); }
);
async function runTest() {
  try {
    const res = await insistGET1;
    console.log(res);
    console.log('^ do something with response.');
  } catch (err) { console.log(err); }
}
runTest();
setTimeout(
  async () => {
    try {
      cancelInsist(insistGET1);
      console.log('canceled insistGET1');
      const res = await insist(() => axios.get('http://localhost:1337/important2'));
      console.log(res);
      console.log('^ do something different now.');
    } catch (err) {
      console.log(err);
    }

  },
  5000);

```



# promise-insist
[![NPM version](https://badge.fury.io/js/promise-insist.svg)](https://www.npmjs.com/package/promise-insist) [![Join the chat at https://gitter.im/PromiseInsist/Lobby](https://badges.gitter.im/PromiseInsist/Lobby.svg)](https://gitter.im/PromiseInsist/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
  <h3 align="center">"When someone fails to fullfill his promise, we'd rather insist about it."</h3>
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

## Npm install
```powershell
npm i promise-insist --save
```

## General Example
```typescript
import PromiseInsist from 'promise-insist'

class GoodluckError extends Error {
  constructor(msg: string, errorCode: number) {
    super(msg);
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, GoodluckError.prototype);
  }
  private errorCode: number;
  public getErrorCode() {
    return this.errorCode;
  }
}

function getRand(min, max): number {
  const _min = Math.ceil(min);
  const _max = Math.floor(max);
  return Math.floor(Math.random() * (_max - _min)) + _min;
}

//re-usable call wrapper for insisting on getting a random number
const guessCallwrapper = (guess: number) => () => new Promise<number>(
  (resolve, reject) => {
    setTimeout(() => { }, 2000);
    const magicNumber = getRand(1, 10);
    if (magicNumber === guess) {
      resolve(magicNumber);
    } else {
      reject(new GoodluckError('Random magic number wasn\'t guessed.', 777));
    }
  });

/**
 * Create a PromiseInsist instance with an optional config of 30 retries and a static delay of 2000.
 * Default: retries = 10 , delay = 1000
 */
const { insist, cancel, replaceTask } = new PromiseInsist({ retries: 30, delay: 2000 });

// Handles to be assigned per insisting promise.
const t1_ID = 't1', t2_ID = 't2';

/**
 * Insist on guessing 5 to be completed within a max 30 retries, handle error if it still fails after that..
 */

insist(
  t1_ID, //The handle
  guessCallwrapper(5), //The promise wrapper to insist on.
  // A retry hook, executed on every attempt, passed in current attempt count and time consumed by the last retry
  (attemptCount, timeConsumed) => {
    console.log(`Attempt #${attemptCount} done in ${timeConsumed} ms`);
  }
)
  .then(res => { console.log(`${t1_ID} : Magic number ${res} was guessed!`); })
  .catch(err => console.log(`${t1_ID}: ${err}`));

/**
 * Retry cancelation test:
 *
 * After executing the guess 5 insisting promise,let's wait (3,5) seconds, then cancel
 * the retrying process incase it was still active, then insist on guessing another number: 7
 * this time defining a custom configuration per this insist and add a whitelisting error filter
 * tomake sure it only retries if thereturned error code was 777.
 */
setTimeout(
  () => {
    cancel(t1_ID)
      .then(
        () => insist(
          t2_ID,
          guessCallwrapper(7),
          //no retry hook this time
          null,

          { delay: 2000, retries: 10, errorFilter: (err: GoodluckError) => err.getErrorCode() === 777 }
        )
      )
      .then(res => { console.log(`${t2_ID} : Magic number ${res} was guessed!`); })
      .catch(err => console.log(`${t2_ID} : ${err}`));
  },
  getRand(3000, 5000));

/**
 * After 4 seconds, replace the task of guessing 7 to yet another task of guessing 3
 * so that in case the current task is still retrying, the replaced task will be swapped
 * while maintaining the retries count. (useful in things like rate-limits etc.)
 */
setTimeout(
  () => {
    replaceTask(t2_ID, guessCallwrapper(3));
  },
  4000);
```
## Example Output

```powershell
Attempt #29 done in 0 ms
Retrying t1 after 2000 ms
Attempt #28 done in 0 ms
Retrying t1 after 2000 ms
Attempt #27 done in 0 ms
Retrying t1 after 2000 ms
Canceled task of ID : t1 (~ 4556 ms)
Retrying t2 after 2000 ms
t1: Error: Random magic number wasn't guessed.
Retrying t2 after 2000 ms
Retrying t2 after 2000 ms
Retrying t2 after 2000 ms
Retrying t2 after 2000 ms
t2 : Magic number 3 was guessed!
^ guessed number would've been 7 if we didn't replace the second task again.
```
___
#### You can also choose a preset for the **Delay** and **ErrorFilter** (you can write yours and submit a PR).
## Axios Example:
```typescript
import PromiseInsist from 'promise-insist';
import { ErrorFilters, Delays } from 'promise-insist/presets';
import axios from 'axios';

// A preset of Delays error filters.
const { ExponentialDelay } = Delays;
//A Preset of Axios error filters.
const { isRetryable, isServerError, isNetError, isSafe, isIdempotent } = ErrorFilters.AxiosErrorFilters;

//Create an Axios PromiseInsist instance with 20 retries per request , exponential delay and only retry if error is a server error.
const {
  insist,
  cancel,
  replaceTask
} = new PromiseInsist({ retries: 20, delay: ExponentialDelay(), errorFilter: isRetryable });

const t1_ID = 'doSomething';
const t2_ID = 'doSomethingElse';

insist(
  t1_ID,
  () => axios.get('http://localhost:1337'),
  (attemptCount, timeConsumed) => { console.log(`Attempt #${attemptCount} done in ${timeConsumed} ms`); }
)
  .then(res => { console.log(res); console.log('^ do something with response.'); })
  .catch(err => console.log(err));

setTimeout(
  () => {
    cancel(t1_ID)
      .then(() => insist(t2_ID, () => axios.get('http://localhost:1337/important2')))
      .then(res => {
        console.log(res);
        console.log('^ do something different now.');
      })
      .catch(err => console.log(err));
  },
  5000);




```



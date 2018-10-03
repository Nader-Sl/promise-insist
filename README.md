# promise-insist

  <h3 align="center">But you promised..</h3>
  <h4 align="center">"When someone fails to fullfill his promise, we'd rather insist about it."</h3>
 <br/>

Promise-Insist provides flexible functionality to insist on fullfilling a conditional promise by retrying or cancel retrying promises based on error filtering and relational delays.

This is a useful solution for more advanced scenarios when you want to be able to concurrently await many promises and you want to retry each with specific or global configuration and conditions, and you want at any point to be able to cancle retrying a certain task maybe because it collides with another concurrent task of a higher priority.

##### This TS lib can be used in a commonJS environment as well , npm install it via:
```powershell
npm i promise-insist --save
```
## General Example
```typescript
import PromiseInsist from 'promise-insist'

class ExampleError extends Error {
  constructor(msg: string, errorCode: number) {
    super(msg);
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, ExampleError.prototype);
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

//Call wrapper for re-use
const magicCallwrapper = () => new Promise<number>(
  (resolve, reject) => {
    setTimeout(() => { }, 2000);
    const magicNumber = getRand(1, 10);
    if (magicNumber === 5) {
      resolve(magicNumber);
    } else {
      reject(new ExampleError('Random magic number wasn\'t guessed.', 550));
    }
  });

//Create a PromiseInsist instance with 30 retries and a static delay of 2000
const { insist, cancel } = new PromiseInsist({ retries: 30, delay: 2000 });

// IDs to be assigned per insisting promise.
const t1_ID = 't1', t2_ID = 't2';

//Insist on a promise to be resolved within 30 retries, error will be caught if it still fails after that..
insist(t1_ID, magicCallwrapper)
  .then(res => { console.log(`${t1_ID} : Magic number ${res} was guessed!`); })
  .catch(err => console.log(`${t1_ID}: ${err}`));

/*re-usable call wrapper for another promise insist function, this time it overrides
 the global delay and retries values as it adds a new error whitelist filter*/
const insist2CallWrapper = () =>
  insist(
    t2_ID,
    magicCallwrapper,
    { delay: 2000, retries: 10, errorFilter: (err: ExampleError) => err.getErrorCode() === 550 }
  )
    .then(res => { console.log(`${t2_ID} : Magic number ${res} was guessed!`); })
    .catch(err => console.log(`${t2_ID} : ${err}`));

/**
 * Retry cancelation test:
 *
 * After executing the first insisting promise, we wait some random time then cancel
 * the retrying process incase it was still active, then executes the second insisting promise.
 */
setTimeout(
  () => {
    cancel(t1_ID)
      .then(insist2CallWrapper)
      .catch(err => console.log(err));
  },
  getRand(1000, 3000));

```
## Example Output

```powershell
Retrying t1 after 1110.9003204909684 ms
Retrying t1 after 1203.0264217438003 ms
Retrying t1 after 1442.7503457631267 ms
Retrying t1 after 1801.589045514925 ms
Canceled task of ID : t1 (~ 4304 ms)
Retrying t2 after 2000 ms
t1: Error: Error: Random magic number wasn't guessed.
Retrying t2 after 2000 ms
Retrying t2 after 2000 ms
Retrying t2 after 2000 ms
t2 : Magic number 5 was guessed!
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
const { insist, cancel } = new PromiseInsist({ retries: 20, delay: ExponentialDelay(), errorFilter: isRetryable });

// handles assigned per insisting promise, used to cancel any later.
const t1_ID = 'doSomething';
const t2_ID = 'doSomethingElse';

//Insist on a promise to be resolved within 20 retries, error will be caught if it still fails after that..
insist(t1_ID, () => axios.get('http://localhost:1337'))
  .then(res => { console.log(res); console.log('^ do something with response.'); })
  .catch(err => console.log(err));

/**
 * After 3 seconds, cancel any active retry attempts for the earlier request
 * and submit another request with a different url and handler
 */

setTimeout(
  () => {
    cancel(t1_ID)
      .then(() => insist(t2_ID, () => axios.get('http://localhost:1337/important')))
      .then(res => {
        console.log(res);
        console.log('^ do something different now.');
      })
      .catch(err => console.log(err));
  },
  3000);



```



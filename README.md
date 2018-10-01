# Promise-Manager
A promise manager that provides flexible functionality to retry or cancel retrying promises based on error filtering and relational delays, more features are in mind to be implemented, thus the broad name.

This is a useful solution for more advanced scenarios when you want to be able to concurrently await many promises and you want to retry each with specific or global configuration and conditions, and you want at any point to be able to cancle retrying a certain task maybe because it collides with another concurrent task of a higher priority.

##### This TS lib can be used in a commonJS environment as well , npm install it via:
```powershell
npm i promise-manager --save
```
## Example
```typescript
import PromiseManager from 'promise-manager'

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
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function exponentialDelay(maxRetries: number, retryNumber: number) {
  const baseDelay = 1000;
  const delay = 2 ** (maxRetries - retryNumber) * 100;
  const randomSum = delay * 0.2 * Math.random();
  return baseDelay + delay + randomSum;
}

//Call wrapper for re-use
const getMagicCallWrapper = () => new Promise<number>((resolve, reject) => {
  const magicNumber = getRand(1, 10)
  if (magicNumber === 5) resolve(magicNumber)
  else reject(new ExampleError('Random magic number wasn\'t guessed.', 550))
});


//Create a PromiseManager instance with 30 retries and an exponential delay
const { insist, cancel } = new PromiseManager(30, exponentialDelay);

// IDs to be assigned per insisting promise.
const t1_ID = 't1', t2_ID = 't2'

//Insist on a promise to be resolved within 30 retries, error will be caught if it still fails after that..
insist(t1_ID, getMagicCallWrapper)
  .then(res => { console.log(`${t1_ID} : Magic number ${res} was guessed!`) })
  .catch(err => console.log(`${t1_ID}: ${err}`))

/*re-usable call wrapper for another promise insist function, this time it overrides
 the global delay and retries values as it adds a new error whitelist filter*/
const insist2CallWrapper = () => insist(t2_ID, getMagicCallWrapper, { delay: 2000, retries: 10, errorWhitelist: (err: ExampleError) => err.getErrorCode() === 550 })
  .then(res => { console.log(`${t2_ID} : Magic number ${res} was guessed!`) })
  .catch(err => console.log(`${t2_ID} : ${err}`))

/**
 * Retry cancelation test:
 * 
 * After executing the first insisting promise, we wait some random time then cancel
 * the retrying process incase it was still active, then executes the second insisting promise.
 */
setTimeout(() => cancel(t1_ID).then(insist2CallWrapper), getRand(3000, 6000))

```
## Example Output

![alt text](https://puu.sh/BDVac/4ac57cac6a.png "Example Output")

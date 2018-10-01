#Promise-Manager
A promise manager that provides flexible functionality to retry or cancel retrying promises based on error filtering and relational delays.

This is a useful solution for more advanced scenarios when you want to be able to concurrently await many promises and you want to retry each with configuration and conditions specific per promise/task and you want at any point to be able to cancle retrying a certain task maybe because it collides with another concurrently working task that needs to force its priority over the other.

## Example
```typescript
import PromiseManager from 'promise-manager'

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

const getMagicRandRetriever = () => new Promise<number>((resolve, reject) => {
  const magicNumber = getRand(1, 10)
  if (magicNumber === 5) resolve(magicNumber)
  else reject('Not the random magic number.')
});

const promiseManager = new PromiseManager(30, exponentialDelay);
const t1_ID = 't1'
const t2_ID = 't2'

promiseManager.retry<number>(t1_ID,getMagicRandRetriever)
.then(res => { console.log(`${t1_ID} : Magic number ${res} was guessed!`) })
.catch(err => console.log(`${t1_ID}: ${err}`))

promiseManager.retry<number>(t2_ID,getMagicRandRetriever)
.then(res => { console.log(`${t2_ID} : Magic number ${res} was guessed!`) })
.catch(err => console.log(`${t2_ID} : ${err}`))

setTimeout(() => promiseManager.cancel(t1_ID), 5000)
setTimeout(() => promiseManager.cancel(t2_ID), 8000)
```
## Example Output

![alt text](https://puu.sh/BDVac/4ac57cac6a.png "Example Output

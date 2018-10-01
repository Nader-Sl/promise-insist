import PromiseManager from '.'

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
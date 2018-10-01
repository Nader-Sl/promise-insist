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
  else reject('Random magic number wasn\'t guessed.')
});


const { insist, cancel } = new PromiseManager(30, exponentialDelay);
const t1_ID = 't1', t2_ID = 't2'

insist(t1_ID, getMagicRandRetriever)
  .then(res => { console.log(`${t1_ID} : Magic number ${res} was guessed!`) })
  .catch(err => console.log(`${t1_ID}: ${err}`))

insist(t2_ID, getMagicRandRetriever)
  .then(res => { console.log(`${t2_ID} : Magic number ${res} was guessed!`) })
  .catch(err => console.log(`${t2_ID} : ${err}`))

setTimeout(() => cancel(t1_ID), 5000)
setTimeout(() => cancel(t2_ID), 8000)
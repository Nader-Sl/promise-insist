/** Commonjs Import Style
 * var PromiseInsist = require('promise-insist').default;
 */
import PromiseInsist from '..';

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


import PromiseInsist from '..';

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

//re-usable call wrapper for insisting on getting a random number of value 5
const guess5Callwrapper = () => new Promise<number>(
  (resolve, reject) => {
    setTimeout(() => { }, 2000);
    const magicNumber = getRand(1, 10);
    if (magicNumber === 5) {
      resolve(magicNumber);
    } else {
      reject(new GoodluckError('Random magic number wasn\'t guessed.', 777));
    }
  });

//re-usable call wrapper for insisting on getting a random number of value 7
const guess7Callwrapper = () => new Promise<number>(
  (resolve, reject) => {
    setTimeout(() => { }, 2000);
    const magicNumber = getRand(1, 10);
    if (magicNumber === 7) {
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
  guess5Callwrapper, //The promise wrapper to insist on.
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
          guess7Callwrapper,
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
 * After 4 seconds, replace the task of guessing 7 to the previous task of guessing 5
 * so that in case the current task is still retrying, the replaced task will be swapped
 * while maintaining the retries count. (useful in things like rate-limits etc.)
 */
setTimeout(
  () => {
    replaceTask(t2_ID, guess5Callwrapper);
  },
  4000);

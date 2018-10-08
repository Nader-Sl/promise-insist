
import PromiseInsist from '../index';

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
    console.log(`Insist1: Magic number wasn't guessed.. ${err}`);
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
        console.log('Canceled Insist1 ...');
        const res = await insist2;
        console.log(`Insist2 : Magic number ${res} was guessed!`);
      } catch (err) { console.log(`Insist2: Magic number wasn't guessed.. :${err}`); }
    },
    getRand(3000, 4000));
}

testInsist2();


import PromiseInsist, { Delays, ErrorFilters } from '..';
import axios from 'axios';

// A preset of Delays error filters.
const { ExponentialDelay } = Delays;
//A Preset of Axios error filters.
const { isRetryable, isServerError, isNetError, isSafe, isIdempotent } = ErrorFilters.AxiosErrorFilters;

//Create an Axios PromiseInsist instance with 20 retries per request , exponential delay and only retry if error is a server error.
const {
  insist,
  cancelInsist,
  replaceTask
} = new PromiseInsist({ retries: 20, delay: ExponentialDelay(), errorFilter: isRetryable });

const t1_ID = 'doSomething';
const t2_ID = 'doSomethingElse';

export async function runTest() {
  try {
    const res = await insist(
      () => axios.get('http://localhost:1337'),
      (attemptCount, timeConsumed) => { console.log(`Attempt #${attemptCount} done in ${timeConsumed} ms`); }
    );
    console.log(res);
    console.log('^ do something with response.');
  } catch (err) { console.log(err); }
}
runTest();
setTimeout(
  async () => {
    try {
      cancelInsist(t1_ID);
      const res = await insist(() => axios.get('http://localhost:1337/important2'));
      console.log(res);
      console.log('^ do something different now.');
    } catch (err) {
      console.log(err);
    }

  },
  5000);

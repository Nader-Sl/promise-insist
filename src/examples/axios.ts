
/** Commonjs Import Style (via npm)
 * var PromiseInsist = require('promise-insist').default;
 */
import PromiseInsist from '..';
import { ErrorFilters, Delays } from '../presets';
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

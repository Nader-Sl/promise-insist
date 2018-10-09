import PromiseInsist from '../lib/promise-insist';

const maxRetries = 10;
const delay = 50;

const {
  insist,
  cancelInsist,
  replaceTask
} = new PromiseInsist({ retries: maxRetries, delay }).setVerbose(false);

describe('Promise-Insist Test Suite', async () => {

  it('Max Retries with error throw test', async () => {
    let retryCount = 0;
    await expect(
      insist(() => {
        const p = new Promise<number>(
          (resolve, reject) => {
            if (retryCount === maxRetries + 1) {
              resolve();
            } else {
              reject(`error : ${777}`);
            }
          });
        retryCount++;
        return p;
      })
    ).rejects.toMatch(`error : ${777}`);
  });

  it('Original value resolution after some retries test', async () => {
    let retryCount = 0;
    await expect(
      insist(() => {
        const p = new Promise(
          (resolve, reject) => {
            if (retryCount === maxRetries / 2) {
              resolve(retryCount);
            } else {
              reject(`error : ${777}`);
            }
          });
        retryCount++;
        return p;
      })
    ).resolves.toBeCloseTo(maxRetries / 2);
  });

  it('Insist Cancel Test', async () => {
    const rejectedPromiseCaller = (callback) => () => {
      callback();
      return new Promise(
        (resolve, reject) => {
          reject(`error : ${777}`);
        });
    };

    const mockCB = jest.fn();
    const insist1 = insist(rejectedPromiseCaller(mockCB));
    try {
      const delayToCancelAfterHalfMaxTries = Math.ceil(((maxRetries) * delay) * 0.5);
      setTimeout(() => cancelInsist(insist1), delayToCancelAfterHalfMaxTries);
      await insist1;
    } catch (e) {
      expect(mockCB.mock.calls.length).toBe(Math.ceil((maxRetries) * 0.5));
    }
  });

  it('Retry hook test', async () => {
    const rejectedPromiseCaller = (callback) => () => {
      callback();
      return new Promise(
        (resolve, reject) => {
          reject(`error : ${777}`);
        });
    };
    const mockCB = jest.fn(x => x);
    const retryHook = (attemptCount, timeConsumed) => {
      mockCB(`Re-attempt`);
    };
    const insist1 = insist(rejectedPromiseCaller(mockCB), retryHook);
    try {
      await insist1;
    } catch (err) {
      expect(
        mockCB.mock.results.map(x => x.value)
          .filter(x => x === 'Re-attempt'))
        .toEqual(Array(maxRetries)
          .fill('Re-attempt'));
    }
  });

  it('Replace Task/Promise Test', async () => {
    const rejectedPromiseCaller = () => {
      return new Promise(
        (resolve, reject) => {
          reject(`error : ${777}`);
        });
    };

    const resolvedPromiseCaller = () => {
      return new Promise(
        (resolve) => {
          resolve(true);
        });
    };

    const insist1 = insist(rejectedPromiseCaller);
    //replace rejected promise with resolved promise after around half retry time
    setTimeout(() => replaceTask(
      insist1,
      resolvedPromiseCaller
    ),
      maxRetries * delay * 0.5);
    await expect(insist1).resolves.toBeTruthy();
  });

});

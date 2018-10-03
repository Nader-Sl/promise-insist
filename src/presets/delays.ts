
export const ExponentialDelay = (baseDelay = 1000) => (maxRetries: number, retryNumber: number) => {
    const delay = 2 ** (maxRetries - retryNumber) * 100;
    const randomSum = delay * 0.2 * Math.random();
    return baseDelay + delay + randomSum;
};

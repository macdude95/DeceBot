export const sleep = (duration: number) =>
  new Promise(resolve => setTimeout(resolve, duration));

export const withTimeout = <R>(timeout: number, promise: Promise<R>) =>
  new Promise<R>(async (resolve, reject) => {
    const timeoutHandle = setTimeout(() => {
      reject(new Error('Timeout waiting for promise'));
    }, timeout);

    const result = await promise;

    clearTimeout(timeoutHandle);

    resolve(result);
  });

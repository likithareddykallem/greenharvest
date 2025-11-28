// Lightweight Celery bridge. In tests we keep an in-memory queue; in dev/prod we
// simply log the task instead of requiring the celery-node client to be installed.

const testQueue = [];

export const enqueueTask = (taskName, payload) => {
  if (process.env.NODE_ENV === 'test') {
    testQueue.push({ taskName, payload });
    return Promise.resolve();
  }

  // In non-test environments we no-op with a log; the Python Celery worker can be
  // wired in later without breaking the main app.
  console.log('[Celery enqueue]', taskName, payload);
  return Promise.resolve();
};

export const getEnqueuedTasks = () => testQueue;

export const clearTaskQueue = () => {
  testQueue.length = 0;
};


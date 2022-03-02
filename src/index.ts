import { ApolloLink, Observable } from '@apollo/client';
import type { NextLink, Operation, RequestHandler } from '@apollo/client';
import { spawn, Pool, Worker, ModuleThread } from 'threads';

type WorkerModule = { request: (operation: any) => any };

const poolApolloLinkWorker = (path: string) =>
  Pool(() => spawn<WorkerModule>(new Worker(path, { type: 'module' })));

const workerLink = new ApolloLink((operation, forward) => {
  operation.setContext({ start: new Date() });
  return forward(operation);
});

export class ApolloWorkerLink extends ApolloLink {
  _pool: Pool<ModuleThread<WorkerModule>>;
  constructor({
    request,
    workerPath,
  }: {
    request?: RequestHandler;
    workerPath: string;
  }) {
    super(request);
    this._pool = poolApolloLinkWorker(workerPath);
  }

  override request(operation: Operation, forward: NextLink) {
    return new Observable<any>((observer) => {
      const task = this._pool
        .queue(async (worker) => {
          const workerObservable = worker.request(operation);
          await workerObservable.subscribe(
            (value) => observer.next(value),
            (error) => observer.error(error),
            () => observer.complete()
          );
        })
        .then(console.log);
    });
  }
}

import { StateCreator, create, StoreMutatorIdentifier } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';

type WithoutDevtools<T> = Omit<T, 'devtools'>;

type LoggerOptions = {
  enabled: boolean;
  prefix: string;
};

type StoreMiddlewareConfig = {
  devtools?: boolean | { name?: string };
  persist?: boolean | { name?: string; partialize?: (state: any) => Partial<any> };
  logger?: boolean | LoggerOptions;
};

type Middleware = <T extends Record<string, any>, Mps extends [StoreMutatorIdentifier] | []>(
  initializer: StateCreator<T, [...Mps], []>
) => T;

export function createStore<T extends Record<string, any>>(
  config: WithoutDevtools<StoreMiddlewareConfig>,
  initializer: StateCreator<T, [], []>
): T {
  let middlewares: any[] = [];

  if (config.logger !== false) {
    const loggerConfig = config.logger === true ? {} : config.logger;
    const options = {
      enabled: loggerConfig?.enabled ?? true,
      prefix: loggerConfig?.prefix ?? '[Store]',
    };

    if (options.enabled) {
      middlewares.push(
        subscribeWithSelector as unknown as Middleware
      );
    }
  }

  if (config.persist !== false) {
    const persistConfig = config.persist === true ? {} : config.persist;
    middlewares.push(
      persist(initializer, {
        name: persistConfig?.name ?? 'app-storage',
        partialize: persistConfig?.partialize,
      }) as unknown as Middleware
    );
  }

  if (config.devtools !== false) {
    const devtoolsConfig = config.devtools === true ? {} : config.devtools;
    middlewares.push(
      devtools({
        name: (devtoolsConfig as any)?.name ?? 'store',
        enabled: true,
      }) as unknown as Middleware
    );
  }

  let store = initializer as T;

  for (const middleware of middlewares.reverse()) {
    store = middleware(initializeStore(store));
  }

  return create(store);
}

function initializeStore<T extends Record<string, any>>(initializer: StateCreator<T, [], []>): StateCreator<T, [], []> {
  return initializer;
}

export type { StoreMiddlewareConfig, LoggerOptions };
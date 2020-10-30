import { Action, Reducer } from 'redux';

export type ActionHandlers<S, A extends Action> = {
  [key: string]: <T extends A>(state: S, action: T) => S;
};

export type ReducerHandlerFunction<S, T extends Action> = (state: S, action: T) => S;

export interface ReducerBuilder<S, A extends Action> {
  handle<T extends A>(type: string, handlerFunction: ReducerHandlerFunction<S, T>): ReducerBuilder<S, A>;
  build(): Reducer<S, A>;
}

export function createReducer<S, A extends Action>(initialState: S): ReducerBuilder<S, A> {
  const handlersDictionary = new Map<string, Function>();

  return {
    handle<T extends A>(type: string, handlerFunction: ReducerHandlerFunction<S, T>): ReducerBuilder<S, A> {
      if (!handlersDictionary.has(type)) {
        handlersDictionary.set(type, handlerFunction);
      }
      return this;
    },

    build(): Reducer<S, A> {
      const reducer: Reducer<S, A> = (state = initialState, action) => {
        const handler = handlersDictionary.get(action.type);
        if (handler) {
          return handler(state, action);
        }
        return state;
      };
      return reducer;
    },
  };
}

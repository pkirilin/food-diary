export type ValidatorFunction<T> = (value: T) => boolean;

export type EditRequest<T> = {
  id: number;
  payload: T;
};

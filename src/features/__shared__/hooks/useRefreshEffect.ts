import { DependencyList, EffectCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { OperationStatus } from '../models';

type OperationStatusSelector<TState> = (state: TState) => OperationStatus;

export function useRefreshEffect<TState = RootState>(
  statusSelector: OperationStatusSelector<TState>,
  effect: EffectCallback,
  deps: DependencyList = [],
  activateOnInit = true,
): void {
  const status = useSelector(statusSelector);

  useEffect(() => {
    if ((activateOnInit && status === 'idle') || status === 'succeeded') {
      effect();
    }
  }, [status, ...deps]);
}

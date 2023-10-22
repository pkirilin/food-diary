import { DependencyList, EffectCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Status } from '../models';

type StatusSelector<TState> = (state: TState) => Status;

/**
@deprecated Use RTK query's refetch instead
 */
export default function useRefreshEffect<TState = RootState>(
  statusSelector: StatusSelector<TState>,
  effect: EffectCallback,
  deps: DependencyList = [],
  activateOnInit = true,
): void {
  const status = useSelector(statusSelector);

  useEffect(() => {
    if ((activateOnInit && status === 'idle') || status === 'succeeded') {
      effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, ...deps]);
}

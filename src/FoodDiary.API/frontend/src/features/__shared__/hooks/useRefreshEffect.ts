import { DependencyList, EffectCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Status } from '../models';

type StatusSelector<TState> = (state: TState) => Status;

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
  }, [status, ...deps]);
}

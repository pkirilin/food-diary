import { useParams } from 'react-router-dom';

export default function useRouterId(paramName: string): number {
  const routerParams = useParams<Record<string, string>>();
  const targetParam = routerParams[paramName];

  if (!targetParam) {
    return 0;
  }

  const id = Number(targetParam);

  if (isNaN(id)) {
    return 0;
  }

  return id;
}

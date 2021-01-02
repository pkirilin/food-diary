import { useParams } from 'react-router-dom';

export interface ParamsWithId {
  id: string;
}

/**
 * Gets 'id' string value from route params and converts it to number
 */
function useIdFromRoute(): number {
  const { id: idStr } = useParams<ParamsWithId>();
  return idStr ? +idStr : 0;
}

export default useIdFromRoute;

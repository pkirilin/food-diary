import { useParams } from 'react-router-dom';

/**
 * Gets 'id' string value from route params and converts it to number
 */
function useIdFromRoute(): number {
  const { id: idStr } = useParams();
  return idStr ? +idStr : 0;
}

export default useIdFromRoute;

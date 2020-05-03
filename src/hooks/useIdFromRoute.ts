import { useParams } from 'react-router-dom';

function useIdFromRoute(): number {
  const { id: idStr } = useParams();
  return idStr ? +idStr : 0;
}

export default useIdFromRoute;

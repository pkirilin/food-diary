import { useDispatch } from 'react-redux';
import { type AppDispatch } from 'src/store';

const useAppDispatch = () => useDispatch<AppDispatch>();

export default useAppDispatch;

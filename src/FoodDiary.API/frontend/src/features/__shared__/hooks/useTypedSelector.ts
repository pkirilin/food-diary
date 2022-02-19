import { createSelectorHook } from 'react-redux';
import { RootState } from '../../../store';

/** @deprecated Use 'useSelector' with augmented 'DefaultRootState' interface instead */
export default createSelectorHook<RootState>();

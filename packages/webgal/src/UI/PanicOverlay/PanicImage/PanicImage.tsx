import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

/**
 * @todo Allow custom panic image from config
 */
export const PanicImage = () => {
  return (
    <div>
      <img alt="Panic Image" />
    </div>
  );
};

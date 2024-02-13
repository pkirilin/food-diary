import { useState, useEffect } from 'react';
import { useLocation, useNavigation } from 'react-router-dom';

export const useNavigationProgress = (): boolean => {
  const location = useLocation();
  const navigation = useNavigation();
  const [navigationProgressVisible, setNavigationProgressVisible] = useState(false);

  useEffect(() => {
    if (navigation.state === 'loading') {
      setNavigationProgressVisible(true);
    }
  }, [navigation.state]);

  useEffect(() => {
    setNavigationProgressVisible(false);
  }, [location]);

  return navigationProgressVisible;
};

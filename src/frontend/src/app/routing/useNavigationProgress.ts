import { useState, useEffect } from 'react';
import { useLocation, useNavigation } from 'react-router-dom';

interface NavigationProgress {
  visible: boolean;
}

export const useNavigationProgress = (): NavigationProgress => {
  const location = useLocation();
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (navigation.state === 'loading') {
      setVisible(true);
    }
  }, [navigation.state]);

  useEffect(() => {
    setVisible(false);
  }, [location]);

  return { visible };
};

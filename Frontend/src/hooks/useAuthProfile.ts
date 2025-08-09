import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';

export const useAuthProfile = () => {
  const authContext = useAuth();
  const profileContext = useProfile();

  if (!authContext || !profileContext) {
    throw new Error('useAuthProfile must be used within both AuthProvider and ProfileProvider');
  }

  const logout = async (): Promise<void> => {
    // Clear profile data first
    profileContext.clearProfile();
    // Then logout user
    await authContext.logout();
  };

  return {
    ...authContext,
    ...profileContext,
    logout,
  };
};

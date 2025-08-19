import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface Profile {
  displayName: string;
  bio: string;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  githubProfile: string;
  preferredLanguages: string[];
  codingSkills: string[];
  profilePicture: string;
}

interface ProfileContextType {
  profile: Profile | null;
  isLoading: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<boolean>;
  uploadProfilePicture: (file: File) => Promise<boolean>;
  deleteProfilePicture: () => Promise<boolean>;
  clearProfile: () => void;
  deleteAccount: (password: string) => Promise<boolean>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider = ({ children }: ProfileProviderProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [currentObjectUrl, setCurrentObjectUrl] = useState<string>('');

  const getPictureObjectUrl = async (): Promise<string> => {
    try {
      const res = await axios.get('http://localhost:4000/api/user-profile/picture', {
        withCredentials: true,
        responseType: 'blob'
      });
      const contentType = res.headers['content-type'] || 'image/*';
      const blob = new Blob([res.data], { type: contentType });
      const newUrl = URL.createObjectURL(blob);
      // Revoke previous URL to prevent stale image/caching and memory leaks
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
      setCurrentObjectUrl(newUrl);
      return newUrl;
    } catch (e) {
      return '';
    }
  };

  const fetchProfile = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('http://localhost:4000/api/user-profile', {
        withCredentials: true,
      });
      const pictureUrl = await getPictureObjectUrl();
      setProfile({ ...data, profilePicture: pictureUrl });
    } catch (error: any) {
      console.error('Fetch profile error:', error);
      // Set default profile if none exists
      setProfile({
        displayName: '',
        bio: '',
        experienceLevel: 'Beginner',
        githubProfile: '',
        preferredLanguages: [],
        codingSkills: [],
        profilePicture: ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh/clear profile when auth user changes (e.g., switching accounts)
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      // Revoke any existing object URL on logout
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
        setCurrentObjectUrl('');
      }
      setProfile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const updateProfile = async (profileData: Partial<Profile>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data } = await axios.put(
        'http://localhost:4000/api/user-profile',
        profileData,
        { withCredentials: true }
      );
      if (data.success) {
        setProfile(data.profile);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Update profile error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProfilePicture = async (file: File): Promise<boolean> => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const { data } = await axios.post(
        'http://localhost:4000/api/user-profile/picture',
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (data.success) {
        const url = await getPictureObjectUrl();
        setProfile(prev => prev ? { ...prev, profilePicture: url } : { 
          displayName: '', bio: '', experienceLevel: 'Beginner', githubProfile: '', preferredLanguages: [], codingSkills: [], profilePicture: url
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Upload profile picture error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProfilePicture = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data } = await axios.delete(
        'http://localhost:4000/api/user-profile/picture',
        { withCredentials: true }
      );

      if (data.success) {
        // Revoke any existing object URL so UI clears immediately
        if (currentObjectUrl) {
          URL.revokeObjectURL(currentObjectUrl);
          setCurrentObjectUrl('');
        }
        setProfile(prev => prev ? { ...prev, profilePicture: '' } : null);
        return true;
      }
      return false;
    } catch (error: any) {
      // If server says "No profile picture found" (404), treat as success and clear UI
      if (error?.response?.status === 404) {
        if (currentObjectUrl) {
          URL.revokeObjectURL(currentObjectUrl);
          setCurrentObjectUrl('');
        }
        setProfile(prev => prev ? { ...prev, profilePicture: '' } : prev);
        return true;
      }
      console.error('Delete profile picture error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearProfile = (): void => {
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      setCurrentObjectUrl('');
    }
    setProfile(null);
  };

  const deleteAccount = async (password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data } = await axios.delete(
        'http://localhost:4000/api/user-profile/account',
        {
          data: { password },
          withCredentials: true
        }
      );

      if (data.success) {
        setProfile(null);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Delete account error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        fetchProfile,
        updateProfile,
        uploadProfilePicture,
        deleteProfilePicture,
        clearProfile,
        deleteAccount,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

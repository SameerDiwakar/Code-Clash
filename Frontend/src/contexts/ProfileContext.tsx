import { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

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

  const fetchProfile = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('http://localhost:4000/api/user-profile', {
        withCredentials: true,
      });
      setProfile(data);
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
        setProfile(prev => prev ? { ...prev, profilePicture: data.profilePicture } : null);
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
        setProfile(prev => prev ? { ...prev, profilePicture: '' } : null);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Delete profile picture error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearProfile = (): void => {
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

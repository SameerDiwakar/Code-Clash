import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MultiSelect } from '@/components/index/MultiSelect';
import { User, Camera, Github, Save, ArrowLeft, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfilePictureSection from '@/components/profile/ProfilePictureSection';
import ProfileForm from '@/components/profile/ProfileForm';

const programmingLanguages = [
  'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'Go', 'Rust',
  'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart', 'Scala', 'C', 'HTML/CSS'
];

const skills = [
  'Data Structures', 'Algorithms', 'Dynamic Programming', 'Graph Theory',
  'System Design', 'Database Design', 'Frontend Development', 'Backend Development',
  'Machine Learning', 'DevOps', 'Mobile Development', 'Game Development'
];

const Profile = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [name, setName] = useState(user?.username || '');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Mock API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const profileData = {
        name,
        bio,
        experience,
        githubLink,
        preferredLanguages: selectedLanguages,
        skills: selectedSkills,
        profilePicture
      };
      
      console.log('Saving profile:', profileData);
      toast.success('Profile updated successfully! 🎉');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.03%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <ProfileHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <ProfilePictureSection
              profilePicture={profilePicture}
              username={user?.username}
                    onChange={handleProfilePictureChange}
                  />
          </div>
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <ProfileForm
              name={name}
              setName={setName}
              bio={bio}
              setBio={setBio}
              experience={experience}
              setExperience={setExperience}
              githubLink={githubLink}
              setGithubLink={setGithubLink}
              selectedLanguages={selectedLanguages}
              setSelectedLanguages={setSelectedLanguages}
              selectedSkills={selectedSkills}
              setSelectedSkills={setSelectedSkills}
              isLoading={isLoading}
              handleSave={handleSave}
              programmingLanguages={programmingLanguages}
              skills={skills}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
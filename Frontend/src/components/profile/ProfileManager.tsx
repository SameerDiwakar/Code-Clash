import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Trash2, User, Github, Code, Award } from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';
import { toast } from 'sonner';

const PROGRAMMING_LANGUAGES = [
  'JavaScript', 'Python', 'Java', 'C++'
];

const CODING_SKILLS = [
  'Frontend Development', 'Backend Development', 'Full Stack Development',
  'Mobile Development', 'DevOps', 'Machine Learning', 'Data Science',
  'Cybersecurity', 'Game Development', 'Blockchain', 'Cloud Computing',
  'UI/UX Design', 'Database Design', 'System Architecture'
];

const ProfileManager = () => {
  const { profile, isLoading, fetchProfile, updateProfile, uploadProfilePicture, deleteProfilePicture, deleteAccount } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    experienceLevel: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert',
    githubProfile: '',
    preferredLanguages: [] as string[],
    codingSkills: [] as string[]
  });

  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        experienceLevel: profile.experienceLevel || 'Beginner',
        githubProfile: profile.githubProfile || '',
        preferredLanguages: profile.preferredLanguages || [],
        codingSkills: profile.codingSkills || []
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password to confirm');
      return;
    }
    const confirmed = window.confirm('This will permanently delete your account and profile. Continue?');
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      const success = await deleteAccount(deletePassword);
      if (success) {
        toast.success('Account deleted successfully');
        // Optionally redirect to landing/login
        setTimeout(() => {
          window.location.href = '/';
        }, 800);
      } else {
        toast.error('Failed to delete account. Check your password and try again.');
      }
    } catch (err) {
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
      setDeletePassword('');
    }
  };

  const addLanguage = () => {
    if (selectedLanguage && !formData.preferredLanguages.includes(selectedLanguage)) {
      setFormData(prev => ({
        ...prev,
        preferredLanguages: [...prev.preferredLanguages, selectedLanguage]
      }));
      setSelectedLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      preferredLanguages: prev.preferredLanguages.filter(lang => lang !== language)
    }));
  };

  const addSkill = () => {
    if (selectedSkill && !formData.codingSkills.includes(selectedSkill)) {
      setFormData(prev => ({
        ...prev,
        codingSkills: [...prev.codingSkills, selectedSkill]
      }));
      setSelectedSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      codingSkills: prev.codingSkills.filter(s => s !== skill)
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const success = await updateProfile(formData);
      if (success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const success = await uploadProfilePicture(file);
      if (success) {
        toast.success('Profile picture uploaded successfully!');
      } else {
        toast.error('Failed to upload profile picture');
      }
    } catch (error) {
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePicture = async () => {
    try {
      const success = await deleteProfilePicture();
      if (success) {
        toast.success('Profile picture deleted successfully!');
      } else {
        toast.error('Failed to delete profile picture');
      }
    } catch (error) {
      toast.error('Failed to delete profile picture');
    }
  };

  const profileImageUrl = profile?.profilePicture || null;

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Profile Picture Section */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-purple-500/30">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-slate-700 border-2 border-cyan-400/50 flex items-center justify-center overflow-hidden">
              {profileImageUrl ? (
                <img 
                  src={profileImageUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-cyan-400" />
              )}
            </div>
            <Button
              size="sm"
              className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-purple-600 hover:bg-purple-700"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold text-cyan-400 mb-2">Profile Picture</h2>
            <p className="text-slate-400 mb-4">Upload your battle avatar</p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload Picture'}
              </Button>
              {profileImageUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeletePicture}
                  disabled={isUploading}
                  className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Profile Information */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-purple-500/30">
        <h2 className="text-xl font-bold text-cyan-400 mb-6 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Profile Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-cyan-400 font-medium">
              Display Name
            </Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="Your warrior name"
              className="bg-slate-800/50 border-purple-500/30 text-white placeholder-slate-400 focus:border-cyan-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceLevel" className="text-cyan-400 font-medium">
              Experience Level
            </Label>
            <Select
              value={formData.experienceLevel}
              onValueChange={(value) => handleInputChange('experienceLevel', value)}
            >
              <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-white focus:border-cyan-400">
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-purple-500/30">
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <Label htmlFor="bio" className="text-cyan-400 font-medium">
            Bio
          </Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell other warriors about yourself..."
            className="bg-slate-800/50 border-purple-500/30 text-white placeholder-slate-400 focus:border-cyan-400 min-h-[100px]"
          />
        </div>

        <div className="mt-6 space-y-2">
          <Label htmlFor="githubProfile" className="text-cyan-400 font-medium flex items-center">
            <Github className="w-4 h-4 mr-2" />
            GitHub Profile
          </Label>
          <Input
            id="githubProfile"
            value={formData.githubProfile}
            onChange={(e) => handleInputChange('githubProfile', e.target.value)}
            placeholder="https://github.com/yourusername"
            className="bg-slate-800/50 border-purple-500/30 text-white placeholder-slate-400 focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Programming Languages */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-purple-500/30">
        <h2 className="text-xl font-bold text-cyan-400 mb-6 flex items-center">
          <Code className="w-5 h-5 mr-2" />
          Preferred Languages
        </h2>
        
        <div className="flex space-x-2 mb-4">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-white focus:border-cyan-400">
              <SelectValue placeholder="Select a programming language" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-purple-500/30">
              {PROGRAMMING_LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={addLanguage}
            disabled={!selectedLanguage}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.preferredLanguages.map((language) => (
            <Badge
              key={language}
              variant="secondary"
              className="bg-purple-600/20 text-purple-300 border-purple-500/30"
            >
              {language}
              <button
                onClick={() => removeLanguage(language)}
                className="ml-2 text-purple-300 hover:text-white"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Coding Skills */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-purple-500/30">
        <h2 className="text-xl font-bold text-cyan-400 mb-6 flex items-center">
          <Award className="w-5 h-5 mr-2" />
          Coding Skills
        </h2>
        
        <div className="flex space-x-2 mb-4">
          <Select value={selectedSkill} onValueChange={setSelectedSkill}>
            <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-white focus:border-cyan-400">
              <SelectValue placeholder="Select your coding expertise areas" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-purple-500/30">
              {CODING_SKILLS.map((skill) => (
                <SelectItem key={skill} value={skill}>{skill}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={addSkill}
            disabled={!selectedSkill}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.codingSkills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="bg-green-600/20 text-green-300 border-green-500/30"
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="ml-2 text-green-300 hover:text-white"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveProfile}
          disabled={isLoading}
          className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-semibold px-8 py-3"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            'Save Profile'
          )}
        </Button>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="mt-8 bg-red-900/20 rounded-lg p-6 border border-red-500/30">
        <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center">
          <Trash2 className="w-5 h-5 mr-2" />
          Danger Zone
        </h2>
        <p className="text-red-300 mb-4">Deleting your account will remove your user and profile data permanently. This action cannot be undone.</p>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="deletePassword" className="text-red-300">Confirm Password</Label>
            <Input
              id="deletePassword"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="bg-slate-800/50 border-red-500/30 text-white focus:border-red-400"
              placeholder="Enter your password"
            />
          </div>
          <Button
            onClick={handleDeleteAccount}
            disabled={isDeleting || !deletePassword}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
          >
            {isDeleting ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Deleting...
              </>
            ) : (
              'Delete Account'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileManager;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MultiSelect } from '@/components/MultiSelect';
import { User, Camera, Github, Save, ArrowLeft, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/20">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400/20">
              <Link to="/leaderboard">
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard
              </Link>
            </Button>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <User className="h-8 w-8 text-cyan-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Warrior Profile
              </h1>
              <Trophy className="h-8 w-8 text-purple-400" />
            </div>
            <p className="text-slate-400 text-lg">Customize your coding warrior profile</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <Card className="bg-black/40 backdrop-blur-lg border border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-4">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-400/30 flex items-center justify-center overflow-hidden">
                      {profilePicture ? (
                        <img 
                          src={profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="h-16 w-16 text-cyan-400" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                      <Camera className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  
                  <Label htmlFor="profile-picture" className="cursor-pointer">
                    <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/20" asChild>
                      <span>
                        <Camera className="h-4 w-4 mr-2" />
                        Upload Picture
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </div>
                
                <div className="text-center space-y-2">
                  <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                    {user?.username || 'Warrior'}
                  </Badge>
                  <p className="text-slate-400 text-sm">
                    Upload your battle avatar
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 backdrop-blur-lg border border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-cyan-400 font-medium">
                      Display Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your warrior name"
                      className="bg-slate-800/50 border-purple-500/30 text-white placeholder-slate-400 focus:border-cyan-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-cyan-400 font-medium">
                      Experience Level
                    </Label>
                    <Input
                      id="experience"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g., 3 years, Beginner, Expert"
                      className="bg-slate-800/50 border-purple-500/30 text-white placeholder-slate-400 focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-cyan-400 font-medium">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell other warriors about yourself..."
                    className="bg-slate-800/50 border-purple-500/30 text-white placeholder-slate-400 focus:border-cyan-400 min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github" className="text-cyan-400 font-medium">
                    GitHub Profile
                  </Label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="github"
                      value={githubLink}
                      onChange={(e) => setGithubLink(e.target.value)}
                      placeholder="https://github.com/yourusername"
                      className="bg-slate-800/50 border-purple-500/30 text-white placeholder-slate-400 focus:border-cyan-400 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-cyan-400 font-medium">
                    Preferred Languages
                  </Label>
                  <MultiSelect
                    options={programmingLanguages}
                    selectedValues={selectedLanguages}
                    onChange={setSelectedLanguages}
                    placeholder="Select your favorite programming languages"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-cyan-400 font-medium">
                    Coding Skills
                  </Label>
                  <MultiSelect
                    options={skills}
                    selectedValues={selectedSkills}
                    onChange={setSelectedSkills}
                    placeholder="Select your coding expertise areas"
                  />
                </div>

                <div className="pt-6">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading || !name.trim()}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-3 text-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving Profile...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
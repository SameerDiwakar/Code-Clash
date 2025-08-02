import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Github, Save } from 'lucide-react';
import { MultiSelect } from '@/components/index/MultiSelect';

interface ProfileFormProps {
  name: string;
  setName: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  experience: string;
  setExperience: (v: string) => void;
  githubLink: string;
  setGithubLink: (v: string) => void;
  selectedLanguages: string[];
  setSelectedLanguages: (v: string[]) => void;
  selectedSkills: string[];
  setSelectedSkills: (v: string[]) => void;
  isLoading: boolean;
  handleSave: () => void;
  programmingLanguages: string[];
  skills: string[];
}

const ProfileForm = ({
  name,
  setName,
  bio,
  setBio,
  experience,
  setExperience,
  githubLink,
  setGithubLink,
  selectedLanguages,
  setSelectedLanguages,
  selectedSkills,
  setSelectedSkills,
  isLoading,
  handleSave,
  programmingLanguages,
  skills
}: ProfileFormProps) => (
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
);

export default ProfileForm; 
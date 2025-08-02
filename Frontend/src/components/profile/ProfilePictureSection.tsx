import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, User } from 'lucide-react';

interface ProfilePictureSectionProps {
  profilePicture: string;
  username?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfilePictureSection = ({ profilePicture, username, onChange }: ProfilePictureSectionProps) => (
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
          onChange={onChange}
          className="hidden"
        />
      </div>
      <div className="text-center space-y-2">
        <Badge variant="outline" className="border-cyan-400 text-cyan-400">
          {username || 'Warrior'}
        </Badge>
        <p className="text-slate-400 text-sm">
          Upload your battle avatar
        </p>
      </div>
    </CardContent>
  </Card>
);

export default ProfilePictureSection; 
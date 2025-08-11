import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sword, LogOut, Shield, Users, Trophy, User as UserIcon, Settings, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useProfile } from "@/contexts/ProfileContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, logout } = useAuth();
  const { profile } = useProfile();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <header className="relative z-10 border-b border-purple-500/30 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Sword className="h-8 w-8 text-cyan-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              CodeClash
            </h1>
            <Badge variant="outline" className="border-cyan-400 text-cyan-400 animate-pulse">
              BATTLE ARENA
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger className="outline-none">
                    <div className="group flex items-center gap-4">
                      <div className="hidden sm:block text-right">
                        <p className="text-sm leading-4 text-cyan-300 group-hover:text-cyan-200 transition-colors">{user.username}</p>
                        <p className="text-[11px] text-purple-300/80">{profile?.experienceLevel || "Beginner"}</p>
                      </div>
                      <div className="relative">
                        <div className="p-[2px] rounded-full bg-gradient-to-br from-cyan-400/60 to-purple-500/60 group-hover:from-cyan-400 group-hover:to-purple-500 transition-colors">
                          <Avatar className="h-12 w-12 border border-cyan-500/30 bg-black">
                            <AvatarImage src={profile?.profilePicture || ""} alt={user.username} className="object-cover" />
                            <AvatarFallback className="bg-cyan-900/60 text-cyan-200">
                              {user.username?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <span className="absolute -bottom-0 -right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-black" />
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="min-w-[220px] rounded-xl border border-cyan-500/20 bg-zinc-900/95 backdrop-blur-md p-2 shadow-xl shadow-cyan-500/10"
                  >
                    <div className="flex items-center gap-3 px-2 py-2">
                      <Avatar className="h-9 w-9 border border-cyan-500/30 bg-black">
                        <AvatarImage src={profile?.profilePicture || ""} alt={user.username} className="object-cover" />
                        <AvatarFallback className="bg-cyan-900/60 text-cyan-200">
                          {user.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-cyan-200">{user.username}</div>
                        <div className="text-[11px] text-purple-300/80">{profile?.experienceLevel || "Beginner"}</div>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-cyan-500/20" />
                    <DropdownMenuItem asChild className="text-cyan-200 focus:text-cyan-100 focus:bg-cyan-500/10">
                      <Link to="/dashboard" className="w-full flex items-center">
                        <Shield className="h-4 w-4 mr-2" /> Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-cyan-200 focus:text-cyan-100 focus:bg-cyan-500/10">
                      <Link to="/leaderboard" className="w-full flex items-center">
                        <Trophy className="h-4 w-4 mr-2 text-yellow-400" /> Leaderboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-cyan-200 focus:text-cyan-100 focus:bg-cyan-500/10">
                      <Link to="/profile" className="w-full flex items-center">
                        <UserIcon className="h-4 w-4 mr-2" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-cyan-500/20" />
                    <DropdownMenuItem asChild className="text-cyan-200 focus:text-cyan-100 focus:bg-cyan-500/10">
                      <Link to="/profile" className="w-full flex items-center">
                        <Settings className="h-4 w-4 mr-2" /> Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-cyan-200 focus:text-cyan-100 focus:bg-cyan-500/10">
                      <Link to="/profile" className="w-full flex items-center">
                        <HelpCircle className="h-4 w-4 mr-2" /> Help & Support
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-cyan-500/20" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/20">
                  <Link to="/login">
                    <Shield className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-semibold">
                  <Link to="/register">
                    <Users className="h-4 w-4 mr-2" />
                    Join Now
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
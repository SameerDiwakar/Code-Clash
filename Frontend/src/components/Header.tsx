import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sword, LogOut, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Header = () => {
  const { user, logout } = useAuth();

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
                <span className="text-cyan-400 font-medium">
                  Welcome, {user.username}!
                </span>
                <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/20">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  className="border-red-500 text-red-300 hover:bg-red-500/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
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
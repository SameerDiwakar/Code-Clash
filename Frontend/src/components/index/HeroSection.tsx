import { Button } from "@/components/ui/button";
import { Shield, Flame, Users } from "lucide-react";
import { Link } from "react-router-dom";

type HeroSectionProps = {
  user: any;
};

const HeroSection = ({ user }: HeroSectionProps) => (
  <div className="text-center mb-16">
    <div className="relative inline-block">
      <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
        ENTER THE ARENA
      </h1>
      <div className="absolute -top-2 -left-2 w-4 h-4 bg-cyan-400 rounded-full animate-ping"></div>
      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-purple-400 rounded-full animate-ping delay-1000"></div>
    </div>
    <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
      Challenge elite coders in intense coding battles. Prove your skills, climb the ranks, and become the ultimate coding champion.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      {user ? (
        <>
          <Button asChild size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold px-8 py-4 text-lg shadow-lg shadow-cyan-500/30">
            <Link to="/dashboard">
              <Shield className="h-5 w-5 mr-2" />
              GO TO DASHBOARD
            </Link>
          </Button>
          <Button asChild size="lg" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold px-8 py-4 text-lg shadow-lg shadow-red-500/30">
            <Link to="/join-battle">
              <Flame className="h-5 w-5 mr-2" />
              QUICK BATTLE
            </Link>
          </Button>
        </>
      ) : (
        <>
          <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-bold px-8 py-4 text-lg shadow-lg shadow-purple-500/30">
            <Link to="/login">
              <Shield className="h-5 w-5 mr-2" />
              LOGIN TO BATTLE
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-green-400 text-green-400 hover:bg-green-400/20 px-8 py-4 text-lg">
            <Link to="/register">
              <Users className="h-5 w-5 mr-2" />
              Join Arena
            </Link>
          </Button>
        </>
      )}
    </div>
  </div>
);

export default HeroSection; 
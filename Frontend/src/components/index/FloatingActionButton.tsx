import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Zap, Shield } from "lucide-react";

type FloatingActionButtonProps = {
  user: any;
};

const FloatingActionButton = ({ user }: FloatingActionButtonProps) => (
  <div className="fixed bottom-6 right-6 z-20 space-y-3">
    {user ? (
      <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-lg shadow-purple-500/30 animate-pulse">
        <Link to="/join-battle">
          <Zap className="h-5 w-5" />
        </Link>
      </Button>
    ) : (
      <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 shadow-lg shadow-green-500/30 animate-pulse">
        <Link to="/login">
          <Shield className="h-5 w-5" />
        </Link>
      </Button>
    )}
  </div>
);

export default FloatingActionButton; 
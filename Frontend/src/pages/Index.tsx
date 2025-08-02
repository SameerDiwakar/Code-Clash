
import Header from "../components/index/Header";
import HeroSection from "../components/index/HeroSection";
import BattleStats from "../components/index/BattleStats";
import BattleModes from "../components/index/BattleModes";
import FeaturedBattles from "../components/index/FeaturedBattles";
import FloatingActionButton from "../components/index/FloatingActionButton";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.03%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
      <Header />
      <main className="relative z-10 container mx-auto px-6 py-12">
        <HeroSection user={user} />
        <BattleStats />
        <BattleModes user={user} />
        <FeaturedBattles />
      </main>
      <FloatingActionButton user={user} />
    </div>
  );
};

export default Index;

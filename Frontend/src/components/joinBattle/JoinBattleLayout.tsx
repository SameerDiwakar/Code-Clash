import JoinBattleHeader from './JoinBattleHeader';
import JoinBattleContent from './JoinBattleContent';

const JoinBattleLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <JoinBattleHeader />
      <JoinBattleContent />
    </div>
  );
};

export default JoinBattleLayout;

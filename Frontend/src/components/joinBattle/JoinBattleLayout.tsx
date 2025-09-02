import JoinBattleHeader from './JoinBattleHeader';
import JoinBattleContent from './JoinBattleContent';

const JoinBattleLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <JoinBattleHeader />
      <JoinBattleContent />
    </div>
  );
};

export default JoinBattleLayout;

import CreateBattleHeader from './CreateBattleHeader';
import BattleForm from './BattleForm';

const CreateBattleLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <CreateBattleHeader />
      <BattleForm />
    </div>
  );
};

export default CreateBattleLayout;

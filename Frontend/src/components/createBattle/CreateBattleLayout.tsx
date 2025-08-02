import CreateBattleHeader from './CreateBattleHeader';
import BattleForm from './BattleForm';

const CreateBattleLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <CreateBattleHeader />
      <BattleForm />
    </div>
  );
};

export default CreateBattleLayout;

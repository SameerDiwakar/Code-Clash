interface DashboardWelcomeHeaderProps {
  username?: string;
}

const DashboardWelcomeHeader = ({ username }: DashboardWelcomeHeaderProps) => (
  <div className="text-center mb-12">
    <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
      Welcome back, {username}!
    </h1>
    <p className="text-slate-400 text-lg">Ready for your next coding battle?</p>
  </div>
);

export default DashboardWelcomeHeader; 
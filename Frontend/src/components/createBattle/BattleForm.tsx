import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BattleFormFields from './BattleFormFields';

const BattleForm = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [duration, setDuration] = useState('60'); // Duration in minutes
  const [problemStatement, setProblemStatement] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // Basic validation
    if (!title || !description || !difficulty || !duration || !problemStatement) {
      alert('Please fill in all fields.');
      return;
    }

    // Here you would typically send the data to your backend
    const battleData = {
      title,
      description,
      difficulty,
      duration: parseInt(duration, 10),
      problemStatement,
    };

    // Log the data for now
    console.log('Battle Data:', battleData);

    // Optionally, redirect to the battle arena or dashboard
    navigate('/dashboard');
  };

  return (
    <main className="container mx-auto px-6 py-12">
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-purple-500/30 backdrop-blur-sm max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-purple-400 text-2xl">Design Your Coding Battle</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <BattleFormFields
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              duration={duration}
              setDuration={setDuration}
              problemStatement={problemStatement}
              setProblemStatement={setProblemStatement}
            />
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold">
              Create Battle
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default BattleForm;

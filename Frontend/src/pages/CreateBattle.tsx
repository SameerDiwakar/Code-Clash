import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Swords } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateBattle = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <header className="relative z-10 border-b border-purple-500/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Swords className="h-8 w-8 text-purple-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Create Battle
              </h1>
              <Badge variant="outline" className="border-purple-400 text-purple-400">
                FORGE MODE
              </Badge>
            </div>
            <Button asChild variant="outline" className="border-slate-500 text-slate-300 hover:bg-slate-500/20">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-purple-500/30 backdrop-blur-sm max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-purple-400 text-2xl">Design Your Coding Battle</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="text"
                  placeholder="Battle Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Brief Battle Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 resize-none"
                />
              </div>
              <div>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Duration in Minutes"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Problem Statement"
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 resize-none"
                />
              </div>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold">
                Create Battle
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateBattle;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import BattleFormFields from './BattleFormFields';
import axios from 'axios';

interface Problem {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;
  constraints: string;
  examples: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  points: number;
}

const BattleForm = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [duration, setDuration] = useState('60'); // Duration in minutes
  const [maxParticipants, setMaxParticipants] = useState('100');
  const [startTime, setStartTime] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState('');
  const [problems, setProblems] = useState<Problem[]>([
    {
      title: '',
      description: '',
      difficulty: 'Medium',
      testCases: [{ input: '', expectedOutput: '', isHidden: false }],
      constraints: '',
      examples: [{ input: '', output: '', explanation: '' }],
      points: 100
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addProblem = () => {
    setProblems([...problems, {
      title: '',
      description: '',
      difficulty: 'Medium',
      testCases: [{ input: '', expectedOutput: '', isHidden: false }],
      constraints: '',
      examples: [{ input: '', output: '', explanation: '' }],
      points: 100
    }]);
  };

  const removeProblem = (index: number) => {
    if (problems.length > 1) {
      setProblems(problems.filter((_, i) => i !== index));
    }
  };

  const updateProblem = (index: number, field: keyof Problem, value: any) => {
    const updatedProblems = [...problems];
    updatedProblems[index] = { ...updatedProblems[index], [field]: value };
    setProblems(updatedProblems);
  };

  const addTestCase = (problemIndex: number) => {
    const updatedProblems = [...problems];
    updatedProblems[problemIndex].testCases.push({ input: '', expectedOutput: '', isHidden: false });
    setProblems(updatedProblems);
  };

  const removeTestCase = (problemIndex: number, testCaseIndex: number) => {
    const updatedProblems = [...problems];
    if (updatedProblems[problemIndex].testCases.length > 1) {
      updatedProblems[problemIndex].testCases.splice(testCaseIndex, 1);
      setProblems(updatedProblems);
    }
  };

  const addExample = (problemIndex: number) => {
    const updatedProblems = [...problems];
    updatedProblems[problemIndex].examples.push({ input: '', output: '', explanation: '' });
    setProblems(updatedProblems);
  };

  const removeExample = (problemIndex: number, exampleIndex: number) => {
    const updatedProblems = [...problems];
    if (updatedProblems[problemIndex].examples.length > 1) {
      updatedProblems[problemIndex].examples.splice(exampleIndex, 1);
      setProblems(updatedProblems);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    
try {
  // Basic validation (unchanged)
  if (!title || !description || !difficulty || !duration) {
    alert('Please fill in all required fields.');
    return;
  }

  // Validate problems (unchanged)
  for (let i = 0; i < problems.length; i++) {
    const problem = problems[i];
    if (!problem.title || !problem.description || !problem.difficulty) {
      alert(`Problem ${i + 1} is missing required fields.`);
      return;
    }
  }

  const battleData = {
    title,
    description,
    difficulty,
    duration: parseInt(duration, 10),
    maxParticipants: parseInt(maxParticipants, 10),
    startTime: startTime ? new Date(startTime).toISOString() : undefined,
    isPublic,
    tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    problems
  };

  const response = await axios.post('/api/battles', battleData, {
    withCredentials: true // replaces 'credentials: include'
  });

  alert('Battle created successfully!');
  navigate('/dashboard');
} catch (error: any) {
  console.error('Error creating battle:', error);
  if (error.response && error.response.data) {
    alert(`Error: ${error.response.data.error || 'Failed to create battle'}`);
  } else {
    alert('Failed to create battle. Please try again.');
  }
} finally {
  setIsSubmitting(false);
}

  };

  return (
    <main className="container mx-auto px-6 py-12">
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-purple-500/30 backdrop-blur-sm max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-purple-400 text-2xl">Design Your Coding Battle</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <BattleFormFields
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              duration={duration}
              setDuration={setDuration}
              maxParticipants={maxParticipants}
              setMaxParticipants={setMaxParticipants}
              startTime={startTime}
              setStartTime={setStartTime}
              isPublic={isPublic}
              setIsPublic={setIsPublic}
              tags={tags}
              setTags={setTags}
              problems={problems}
              updateProblem={updateProblem}
              addProblem={addProblem}
              removeProblem={removeProblem}
              addTestCase={addTestCase}
              removeTestCase={removeTestCase}
              addExample={addExample}
              removeExample={removeExample}
            />
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Battle...' : 'Create Battle'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default BattleForm;

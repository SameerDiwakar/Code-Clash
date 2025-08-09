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
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);

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
        withCredentials: true,
        // Treat 400 (validation) as a resolved response so it doesn't throw an AxiosError
        validateStatus: (status) => (status >= 200 && status < 300) || status === 400
      });

      if (response.status === 201) {
        alert('Battle created successfully!');
        navigate('/dashboard');
        return;
      }

      if (response.status === 400) {
        const data = response.data || {};
        const msgs: string[] = [];
        if (data.error) msgs.push(String(data.error));
        if (Array.isArray(data.issues) && data.issues.length) {
          data.issues.forEach((it: any) => {
            const idx = typeof it.index === 'number' ? `Problem ${it.index + 1}: ` : '';
            const reason = it.reason ? String(it.reason) : 'Invalid problem';
            const flags = Array.isArray(it.flags) && it.flags.length ? ` (flags: ${it.flags.join(', ')})` : '';
            msgs.push(`${idx}${reason}${flags}`);
          });
        }
        if (!msgs.length) msgs.push('Battle contains invalid problems.');
        setValidationMessages(msgs);
        setShowValidationModal(true);
        return;
      }

      // Any other unexpected status
      alert(`Error: ${response.data?.error || 'Failed to create battle'}`);
    } catch {
      // Network or unexpected errors (keep silent in console, show user-friendly message)
      alert('Failed to create battle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <main className="container mx-auto px-6 py-12">
      {showValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowValidationModal(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-lg shadow-xl border border-purple-500/40 bg-slate-900 text-slate-100 p-6">
            <h3 className="text-lg font-semibold text-purple-300 mb-3">Battle creation blocked</h3>
            <p className="text-sm text-slate-300 mb-4">Please fix the following issues before submitting again:</p>
            <ul className="list-disc pl-5 space-y-2 max-h-64 overflow-auto">
              {validationMessages.map((m, i) => (
                <li key={i} className="text-sm">{m}</li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowValidationModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
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

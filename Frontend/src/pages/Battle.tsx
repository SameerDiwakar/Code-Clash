import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CodeEditor } from '@/components/index/CodeEditor';
import { ProblemCard } from '@/components/index/ProblemCard';
import { Play, Code, Trophy, ArrowLeft } from 'lucide-react';
import BattleHeader from '@/components/battle/BattleHeader';
import BattleProblemsList from '@/components/battle/BattleProblemsList';
import BattleProblemDetails from '@/components/battle/BattleProblemDetails';
import BattleCodeEditor from '@/components/battle/BattleCodeEditor';
import BattleCustomInput from '@/components/battle/BattleCustomInput';
import BattleSubmitButton from '@/components/battle/BattleSubmitButton';
import BattleSubmissionResult from '@/components/battle/BattleSubmissionResult';

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  inputSample: string;
  outputSample: string;
  constraints: string[];
}

interface SubmissionResult {
  verdict: string;
  output: string;
  executionTime?: string;
  memoryUsed?: string;
}

const Battle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [customInput, setCustomInput] = useState('');
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isParticipant, setIsParticipant] = useState<boolean>(false);
  const [leaveLoading, setLeaveLoading] = useState<boolean>(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [leaveMessage, setLeaveMessage] = useState<string | null>(null);

  // Map backend problem to frontend Problem shape
  const mapBackendProblem = (p: any, index: number): Problem => {
    const firstExample = Array.isArray(p.examples) && p.examples.length > 0 ? p.examples[0] : null;
    const constraintsArr = p.constraints
      ? (typeof p.constraints === 'string' ? p.constraints.split('\n').filter(Boolean) : p.constraints)
      : [];
    return {
      id: p._id || String(index + 1),
      title: p.title,
      description: p.description,
      difficulty: p.difficulty,
      inputSample: firstExample?.input || '',
      outputSample: firstExample?.output || '',
      constraints: Array.isArray(constraintsArr) ? constraintsArr : []
    } as Problem;
  };

  useEffect(() => {
    const fetchBattle = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      setLeaveError(null);
      setLeaveMessage(null);
      try {
        const resp = await axios.get(`http://localhost:4000/api/battles/${id}` , { withCredentials: true });
        // Backend returns the battle object directly; support both shapes for safety
        const battle = resp.data?.battle || resp.data;
        const backendProblems = Array.isArray(battle?.problems) ? battle.problems : [];
        const mapped: Problem[] = backendProblems.map(mapBackendProblem);
        setProblems(mapped);
        setSelectedProblem(mapped[0] || null);

        // Check participant status via debug endpoint (provides currentUserId and flags)
        try {
          const dbg = await axios.get(`http://localhost:4000/api/battles/${id}/debug`, { withCredentials: true });
          const participants = Array.isArray(dbg.data?.participants) ? dbg.data.participants : [];
          const imIn = participants.some((p: any) => p?.isCurrentUser === true);
          setIsParticipant(imIn);
        } catch (dbgErr) {
          // If debug not available, leave as false; page still works
          console.warn('Debug endpoint not available; participant status unknown.');
          setIsParticipant(false);
        }
      } catch (e: any) {
        console.error('Failed to load battle:', e);
        setError(e.response?.data?.error || 'Failed to load battle.');
      } finally {
        setLoading(false);
      }
    };
    fetchBattle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleLeave = async () => {
    if (!id) return;
    setLeaveLoading(true);
    setLeaveError(null);
    setLeaveMessage(null);
    try {
      const resp = await axios.post(`http://localhost:4000/api/battles/${id}/leave`, {}, { withCredentials: true });
      setLeaveMessage(resp.data?.message || 'Left the battle.');
      setIsParticipant(false);
      // Redirect back to Join Battles page
      navigate('/join-battle');
      // Also try to refresh participant status in case user navigates back here
      try {
        const dbg = await axios.get(`http://localhost:4000/api/battles/${id}/debug`, { withCredentials: true });
        const participants = Array.isArray(dbg.data?.participants) ? dbg.data.participants : [];
        const imIn = participants.some((p: any) => p?.isCurrentUser === true);
        setIsParticipant(imIn);
      } catch {}
    } catch (e: any) {
      console.error('Failed to leave battle:', e);
      setLeaveError(e.response?.data?.error || 'Failed to leave battle.');
    } finally {
      setLeaveLoading(false);
    }
  };

  const handleRun = async () => {
    if (!id || !selectedProblem) return;
    setIsRunning(true);
    setSubmissionResult(null);
    try {
      const resp = await axios.post(
        `http://localhost:4000/api/battles/${id}/problems/${selectedProblem.id}/run`,
        { code, language, stdin: customInput },
        { withCredentials: true }
      );
      const data = resp.data || {};
      setSubmissionResult({
        verdict: data.stderr ? 'Runtime Error' : 'Ran',
        output: (data.output || data.stdout || data.stderr || '').toString(),
        executionTime: data.time ? `${data.time}s` : undefined,
        memoryUsed: data.memory ? `${data.memory} KB` : undefined
      });
    } catch (e: any) {
      console.error('Run error:', e);
      setSubmissionResult({
        verdict: 'Error',
        output: e.response?.data?.error || 'Failed to run code.'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!id || !selectedProblem) return;
    setIsSubmitting(true);
    setSubmissionResult(null);
    try {
      const resp = await axios.post(
        `http://localhost:4000/api/battles/${id}/problems/${selectedProblem.id}/submit`,
        { code, language },
        { withCredentials: true }
      );
      const submission = resp.data?.submission;
      const result = submission?.result || {};
      setSubmissionResult({
        verdict: result.status || 'Unknown',
        output: Array.isArray(result.details)
          ? result.details.map((d: any, i: number) => `#${i + 1} ${d.passed ? 'PASS' : 'FAIL'}\nInput:\n${d.input}\nExpected:\n${d.expected}\nGot:\n${d.stdout}\n${d.stderr ? `Stderr:\n${d.stderr}` : ''}`).join('\n\n')
          : 'Submitted.',
        executionTime: typeof result.executionTime !== 'undefined' ? `${result.executionTime}s` : undefined,
        memoryUsed: typeof result.memory !== 'undefined' ? `${result.memory} KB` : undefined
      });
    } catch (e: any) {
      console.error('Submission error:', e);
      setSubmissionResult({
        verdict: 'Error',
        output: e.response?.data?.error || 'Failed to submit code. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300">Loading battle...</div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto mb-4">
        <BattleHeader />
        <div className="ml-4 flex items-center gap-3">
          {isParticipant && (
            <Button onClick={handleLeave} disabled={leaveLoading} className="bg-red-600 hover:bg-red-700 text-white">
              {leaveLoading ? 'Leaving...' : 'Leave Battle'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Problems List */}
        <BattleProblemsList
          problems={problems}
          selectedProblemId={selectedProblem ? selectedProblem.id : ''}
          onSelect={(p) => setSelectedProblem(p)}
                />
        {/* Main Coding Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Problem Details */}
          {selectedProblem && (
            <BattleProblemDetails problem={selectedProblem} />
          )}
          {/* Custom Input */}
          <BattleCustomInput
            customInput={customInput}
            setCustomInput={setCustomInput}
          />
          {/* Code Editor */}
          <BattleCodeEditor
            code={code}
            setCode={setCode}
                language={language}
            setLanguage={setLanguage}
              />
          {/* Run & Submit Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRun}
              disabled={isRunning || !code.trim()}
              size="lg"
              variant="secondary"
              className="px-6"
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </Button>
            {/* Submit Button */}
            <BattleSubmitButton
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              code={code}
            />
          </div>
          {leaveError && (
            <div className="mt-2 text-sm text-red-300">{leaveError}</div>
          )}
          {leaveMessage && (
            <div className="mt-2 text-sm text-green-300">{leaveMessage}</div>
          )}
          {/* Submission Result */}
          <BattleSubmissionResult submissionResult={submissionResult} />
        </div>
      </div>
    </div>
  );
};

export default Battle;

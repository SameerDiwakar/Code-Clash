import { useEffect, useState, useCallback } from 'react';
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
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
  }>;
}

interface SubmissionResult {
  verdict: string;
  output: string;
  executionTime?: string;
  memoryUsed?: string;
  // Backend-detailed result for per-test rendering
  result?: {
    status: string;
    details: Array<{
      testCase: number;
      input: string;
      expectedOutput: string;
      actualOutput: string;
      passed: boolean;
      status: string;
      time: number;
      memory: number;
      stderr?: string;
      isHidden?: boolean;
    }>;
    executionTime: number;
    memory: number;
    totalCases: number;
    passedCases: number;
    failedCases: number;
  };
}

interface SupportedLanguage {
  id: string;
  version: string;
  boilerplate: string; // backend now returns LeetCode-style here
}

const Battle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  // Get a unique storage key based on battle and problem IDs
  const getStorageKey = useCallback((battleId: string, problemId: string) => {
    return `battle_${battleId}_problem_${problemId}_code`;
  }, []);

  // Load code from localStorage when problem changes
  useEffect(() => {
    if (id && selectedProblem?.id) {
      const savedCode = localStorage.getItem(getStorageKey(id, selectedProblem.id));
      if (savedCode) {
        setCode(savedCode);
      } else {
        // Reset to empty if no saved code
        setCode('');
      }
    }
  }, [id, selectedProblem?.id, getStorageKey]);

  // Save code to localStorage when it changes
  const setCodeWithPersistence = useCallback((newCode: string) => {
    setCode(newCode);
    if (id && selectedProblem?.id) {
      localStorage.setItem(getStorageKey(id, selectedProblem.id), newCode);
    }
  }, [id, selectedProblem?.id, getStorageKey]);

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isParticipant, setIsParticipant] = useState<boolean>(false);
  const [leaveLoading, setLeaveLoading] = useState<boolean>(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [leaveMessage, setLeaveMessage] = useState<string | null>(null);
  const [languages, setLanguages] = useState<SupportedLanguage[]>([]);

  // Map backend problem to frontend Problem shape
  const mapBackendProblem = (p: any, index: number): Problem => {
    const firstExample = Array.isArray(p.examples) && p.examples.length > 0 ? p.examples[0] : null;
    const constraintsArr = p.constraints
      ? (typeof p.constraints === 'string' ? p.constraints.split('\n').filter(Boolean) : p.constraints)
      : [];
    
    // Map test cases if they exist
    const testCases = Array.isArray(p.testCases) 
      ? p.testCases.map((tc: any) => ({
          input: tc.input || '',
          expectedOutput: tc.expectedOutput || tc.output || '',
          isHidden: !!tc.isHidden
        }))
      : [];
    
    return {
      id: p._id || String(index + 1),
      title: p.title,
      description: p.description,
      difficulty: p.difficulty,
      inputSample: firstExample?.input || '',
      outputSample: firstExample?.output || '',
      constraints: Array.isArray(constraintsArr) ? constraintsArr : [],
      testCases
    } as Problem;
  };

  // Normalize language identifiers between frontend and backend
  const normalizeBattleLanguage = (lang: string) => {
    // Map frontend language IDs to backend language IDs
    switch (lang) {
      case 'c++': return 'c++';
      case 'java': return 'java';
      case 'javascript': return 'javascript';
      case 'python': return 'python';
      default: return 'python'; // Default to python if unknown
    }
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
  }, [id]);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const resp = await axios.get('http://localhost:4000/api/languages', { withCredentials: true });
        const list: SupportedLanguage[] = resp.data?.languages || [];
        setLanguages(list);
        // Set default language boilerplate from backend (LeetCode-style)
        const def = list.find(l => l.id === 'python') || list[0];
        if (def) {
          setLanguage(def.id);
          setCode(def.boilerplate || '');
        }
      } catch (e) {
        console.warn('Failed to load languages:', e);
        // Set minimal fallback
        setLanguage('python');
        setCode('def solve():\n    pass\n');
      }
    };
    loadLanguages();
  }, [id]); // Add id dependency to reload when battle changes

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    const entry = languages.find(l => l.id === lang);
    // Use backend-provided LeetCode-style boilerplate
    const bp = entry?.boilerplate || '';
    setCodeWithPersistence(bp);
  };

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
        { code, language: normalizeBattleLanguage(language), isLeetCodeStyle: true, functionName: 'solve', useProblemTests: true },
        { withCredentials: true }
      );
      const data = resp.data || {};
      setSubmissionResult({
        verdict: data.stderr ? 'Runtime Error' : 'Executed Successfully',
        output: (data.output || data.stdout || data.stderr || '').toString(),
        executionTime: data.time ? `${data.time}s` : undefined,
        memoryUsed: data.memory ? `${data.memory} KB` : undefined
      });
    } catch (e: any) {
      console.error('Run error:', e);
      setSubmissionResult({
        verdict: 'Execution Failed',
        output: e.response?.data?.error || 'Failed to execute code. Please check your syntax and try again.'
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
        { 
          code, 
          language: normalizeBattleLanguage(language), 
          isLeetCodeStyle: true, 
          functionName: 'solve',
          challengeId: selectedProblem.id // Add challengeId to match backend expectation
        },
        { withCredentials: true }
      );
      const submission = resp.data?.submission;
      const result = submission?.result || {};
      setSubmissionResult({
        verdict: result.status || 'Unknown',
        output: Array.isArray(result.details)
          ? result.details
              .map((d: any, i: number) => {
                const exp = d.expectedOutput ?? d.expected ?? '';
                const got = d.actualOutput ?? d.stdout ?? '';
                return `#${i + 1} ${d.passed ? 'PASS' : 'FAIL'}\nInput:\n${d.input}\nExpected:\n${exp}\nGot:\n${got}${d.stderr ? `\nStderr:\n${d.stderr}` : ''}`;
              })
              .join('\n\n')
          : 'Submitted.',
        executionTime: typeof result.executionTime !== 'undefined' ? `${result.executionTime}s` : undefined,
        memoryUsed: typeof result.memory !== 'undefined' ? `${result.memory} KB` : undefined,
        result
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
            <Button 
              onClick={handleLeave} 
              disabled={leaveLoading} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {leaveLoading ? 'Leaving...' : 'Leave Battle'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-7xl mx-auto">
        {/* Problems List */}
        <BattleProblemsList
          problems={problems}
          selectedProblemId={selectedProblem?.id || ''}
          onSelect={(p) => setSelectedProblem(p)}
        />
        
        {/* Main Coding Area */}
        <div className="space-y-6">
          {/* Problem Details */}
          {selectedProblem && (
            <BattleProblemDetails problem={selectedProblem} />
          )}
          
          {/* Coding Workspace */}
          <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
            {/* Left: Output / Verdict */}
            <div className="order-2 md:order-1 md:col-span-3 space-y-4">
              <BattleSubmissionResult submissionResult={submissionResult} />
              {leaveError && (
                <div className="text-sm text-red-300">{leaveError}</div>
              )}
              {leaveMessage && (
                <div className="text-sm text-green-300">{leaveMessage}</div>
              )}
            </div>

            {/* Right: Code Editor */}
            <div className="order-1 md:order-2 md:col-span-7 space-y-4">
              <BattleCodeEditor
                code={code}
                setCode={setCodeWithPersistence}
                language={language}
                setLanguage={setLanguage}
                problemTitle={selectedProblem?.title}
                problemDescription={selectedProblem?.description}
                examples={selectedProblem ? [{
                  input: selectedProblem.inputSample,
                  output: selectedProblem.outputSample
                }] : []}
              />
              
              {/* Action Buttons */}
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
                <BattleSubmitButton
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  code={code}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Battle;

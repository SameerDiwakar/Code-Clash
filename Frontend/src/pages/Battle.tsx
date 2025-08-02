
import { useState } from 'react';
import { Link } from 'react-router-dom';
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

const mockProblems: Problem[] = [
  {
    id: '1',
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'Easy',
    inputSample: 'nums = [2,7,11,15], target = 9',
    outputSample: '[0,1]',
    constraints: [
      '2 ≤ nums.length ≤ 10⁴',
      '-10⁹ ≤ nums[i] ≤ 10⁹',
      '-10⁹ ≤ target ≤ 10⁹'
    ]
  },
  {
    id: '2',
    title: 'Palindrome Number',
    description: 'Given an integer x, return true if x is a palindrome, and false otherwise.',
    difficulty: 'Easy',
    inputSample: 'x = 121',
    outputSample: 'true',
    constraints: [
      '-2³¹ ≤ x ≤ 2³¹ - 1'
    ]
  },
  {
    id: '3',
    title: 'Longest Substring Without Repeating Characters',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    difficulty: 'Medium',
    inputSample: 's = "abcabcbb"',
    outputSample: '3',
    constraints: [
      '0 ≤ s.length ≤ 5 × 10⁴',
      's consists of English letters, digits, symbols and spaces'
    ]
  }
];

const Battle = () => {
  const [selectedProblem, setSelectedProblem] = useState<Problem>(mockProblems[0]);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [customInput, setCustomInput] = useState('');
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/submit-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemId: selectedProblem.id,
          code,
          language,
          customInput
        })
      });

      const result = await response.json();
      setSubmissionResult(result);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionResult({
        verdict: 'Error',
        output: 'Failed to submit code. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <BattleHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Problems List */}
        <BattleProblemsList
          problems={mockProblems}
          selectedProblemId={selectedProblem.id}
          onSelect={setSelectedProblem}
                />
        {/* Main Coding Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Problem Details */}
          <BattleProblemDetails problem={selectedProblem} />
          {/* Code Editor */}
          <BattleCodeEditor
            code={code}
            setCode={setCode}
                language={language}
            setLanguage={setLanguage}
              />
          {/* Custom Input */}
          <BattleCustomInput
            customInput={customInput}
            setCustomInput={setCustomInput}
          />
          {/* Submit Button */}
          <BattleSubmitButton
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            code={code}
          />
          {/* Submission Result */}
          <BattleSubmissionResult submissionResult={submissionResult} />
        </div>
      </div>
    </div>
  );
};

export default Battle;

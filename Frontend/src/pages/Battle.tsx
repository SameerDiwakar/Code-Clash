
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CodeEditor } from '@/components/CodeEditor';
import { ProblemCard } from '@/components/ProblemCard';
import { Play, Code, Trophy, ArrowLeft } from 'lucide-react';

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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/20">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold neon-text">Battle Arena</h1>
            <Code className="h-8 w-8 text-accent animate-pulse" />
          </div>
          <p className="text-muted-foreground text-lg">Choose your weapon and conquer the challenges!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Problems List */}
        <div className="lg:col-span-1">
          <Card className="battle-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Battle Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockProblems.map((problem) => (
                <ProblemCard
                  key={problem.id}
                  problem={problem}
                  isSelected={selectedProblem.id === problem.id}
                  onClick={() => setSelectedProblem(problem)}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Coding Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Problem Details */}
          <Card className="battle-card border-accent/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-accent">{selectedProblem.title}</CardTitle>
                <Badge 
                  variant={selectedProblem.difficulty === 'Easy' ? 'default' : 
                          selectedProblem.difficulty === 'Medium' ? 'secondary' : 'destructive'}
                  className="animate-glow"
                >
                  {selectedProblem.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedProblem.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Sample Input</h4>
                  <code className="block bg-muted/20 p-3 rounded border text-sm">
                    {selectedProblem.inputSample}
                  </code>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Sample Output</h4>
                  <code className="block bg-muted/20 p-3 rounded border text-sm">
                    {selectedProblem.outputSample}
                  </code>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-primary mb-2">Constraints</h4>
                <ul className="text-muted-foreground text-sm space-y-1">
                  {selectedProblem.constraints.map((constraint, index) => (
                    <li key={index}>• {constraint}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Code Editor */}
          <Card className="battle-card border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-primary">Code Editor</CardTitle>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-40 bg-muted/20 border-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
              />
            </CardContent>
          </Card>

          {/* Custom Input */}
          <Card className="battle-card border-accent/30">
            <CardHeader>
              <CardTitle className="text-accent">Custom Input (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter custom test input..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="bg-muted/20 border-accent/30 min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !code.trim()}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground animate-glow px-8 py-3 text-lg font-semibold"
            >
              <Play className="h-5 w-5 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Solution'}
            </Button>
          </div>

          {/* Submission Result */}
          {submissionResult && (
            <Card className="battle-card border-accent/30 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-accent">Verdict</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={submissionResult.verdict === 'Accepted' ? 'default' : 'destructive'}
                    className="text-lg px-4 py-2"
                  >
                    {submissionResult.verdict}
                  </Badge>
                  {submissionResult.executionTime && (
                    <span className="text-muted-foreground">
                      Time: {submissionResult.executionTime}
                    </span>
                  )}
                  {submissionResult.memoryUsed && (
                    <span className="text-muted-foreground">
                      Memory: {submissionResult.memoryUsed}
                    </span>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-primary mb-2">Output</h4>
                  <pre className="bg-muted/20 p-4 rounded border text-sm overflow-x-auto whitespace-pre-wrap">
                    {submissionResult.output}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Battle;

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff } from 'lucide-react';

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
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
}

interface BattleProblemDetailsProps {
  problem: Problem;
}

const BattleProblemDetails = ({ problem }: BattleProblemDetailsProps) => {
  // Function to format input/output values for display
  const formatValue = (value: string): string => {
    try {
      // Try to parse as JSON to handle arrays/objects
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      // If not valid JSON, return as is
      return value;
    }
  };

  // Function to format the test case display
  const renderTestCase = (testCase: any, index: number) => {
    const formattedInput = formatValue(testCase.input);
    const formattedOutput = formatValue(testCase.expectedOutput);
    
    return (
      <div key={index} className="mb-6 border border-slate-700 rounded-lg overflow-hidden bg-slate-800/40">
        <div className="px-4 py-3 bg-slate-700/50 border-b border-slate-700">
          <span className="font-medium text-slate-200">Test Case {index + 1}</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-slate-400 mb-1">Input</div>
              <pre className="bg-slate-800/80 rounded p-3 font-mono text-sm text-slate-200 whitespace-pre-wrap break-words">
                {formattedInput || 'No input'}
              </pre>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400 mb-1">Expected Output</div>
              <pre className="bg-slate-800/80 rounded p-3 font-mono text-sm text-slate-200 whitespace-pre-wrap break-words">
                {formattedOutput || 'No output'}
              </pre>
            </div>
          </div>
          {testCase.explanation && (
            <div className="mt-3 text-sm text-slate-300 bg-slate-800/50 p-2 rounded">
              <span className="font-medium">Explanation: </span>
              <span>{testCase.explanation}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="battle-card border-accent/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-accent">{problem.title}</CardTitle>
          <Badge
            variant={
              problem.difficulty === 'Easy'
                ? 'default'
                : problem.difficulty === 'Medium'
                ? 'secondary'
                : 'destructive'
            }
            className="animate-glow"
          >
            {problem.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        <div>
          <h4 className="font-semibold text-primary mb-2">Description</h4>
          <p className="text-muted-foreground">{problem.description}</p>
        </div>

        {/* Sample Input/Output */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-primary mb-2">Sample Input</h4>
            <pre className="bg-muted/20 p-3 rounded border text-sm overflow-x-auto">
              {problem.inputSample}
            </pre>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-2">Sample Output</h4>
            <pre className="bg-muted/20 p-3 rounded border text-sm overflow-x-auto">
              {problem.outputSample}
            </pre>
          </div>
        </div>

        {/* Constraints */}
        <div>
          <h4 className="font-semibold text-primary mb-2">Constraints</h4>
          <ul className="text-muted-foreground text-sm space-y-1">
            {problem.constraints.map((constraint, index) => (
              <li key={index}>• {constraint}</li>
            ))}
          </ul>
        </div>

        {/* Test Cases Section - Always show if there are any test cases */}
        {problem.testCases && problem.testCases.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-primary">All Test Cases</h4>
              <span className="text-xs text-muted-foreground">
                {problem.testCases.length} test case{problem.testCases.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-4">
              {problem.testCases.map((testCase, idx) => renderTestCase(testCase, idx))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BattleProblemDetails;
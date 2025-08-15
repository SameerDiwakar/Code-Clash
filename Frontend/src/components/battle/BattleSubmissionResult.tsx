import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle, Zap } from 'lucide-react';

interface TestCaseResult {
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
}

interface SubmissionResult {
  verdict: string;
  output: string;
  executionTime?: string;
  memoryUsed?: string;
  // New Judge0 fields
  result?: {
    status: string;
    details: TestCaseResult[];
    executionTime: number;
    memory: number;
    totalCases: number;
    passedCases: number;
    failedCases: number;
  };
}

interface BattleSubmissionResultProps {
  submissionResult: SubmissionResult | null;
}

const BattleSubmissionResult = ({ submissionResult }: BattleSubmissionResultProps) => {
  if (!submissionResult) return null;

  const hasDetailedResults = submissionResult.result && submissionResult.result.details;
  const isAccepted = submissionResult.verdict === 'Accepted' || submissionResult.result?.status === 'Accepted';
  const isCompilationError = submissionResult.result?.status === 'Compilation Error';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Wrong Answer': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Time Limit Exceeded': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Runtime Error': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'Compilation Error': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Zap className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted': return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'Wrong Answer': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'Time Limit Exceeded': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'Runtime Error': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'Compilation Error': return 'bg-red-600/10 text-red-300 border-red-600/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="battle-card border-accent/30 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-accent flex items-center gap-2">
          {getStatusIcon(submissionResult.result?.status || submissionResult.verdict)}
          Verdict
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center gap-3 flex-wrap">
          <Badge
            className={`text-lg px-4 py-2 border ${getStatusColor(submissionResult.result?.status || submissionResult.verdict)}`}
          >
            {submissionResult.result?.status || submissionResult.verdict}
          </Badge>

          {hasDetailedResults && (
            <>
              <span className="text-sm text-muted-foreground">
                {submissionResult.result!.passedCases}/{submissionResult.result!.totalCases} passed
              </span>
              <span className="text-sm text-muted-foreground">
                Time: {submissionResult.result!.executionTime.toFixed(3)}s
              </span>
              <span className="text-sm text-muted-foreground">
                Memory: {submissionResult.result!.memory} KB
              </span>
            </>
          )}

          {!hasDetailedResults && submissionResult.executionTime && (
            <span className="text-sm text-muted-foreground">
              Time: {submissionResult.executionTime}
            </span>
          )}
          {!hasDetailedResults && submissionResult.memoryUsed && (
            <span className="text-sm text-muted-foreground">
              Memory: {submissionResult.memoryUsed}
            </span>
          )}
        </div>

        {/* Test Cases Results */}
        {hasDetailedResults && (
          <div className="space-y-3">
            <h4 className="font-semibold text-primary">Test Cases</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {submissionResult.result!.details.map((testCase, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border text-sm ${
                    testCase.passed
                      ? 'bg-green-500/5 border-green-500/20'
                      : 'bg-red-500/5 border-red-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {testCase.passed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-medium">
                        Test Case {testCase.testCase} {testCase.isHidden ? '(Hidden)' : ''}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {testCase.status}
                      </Badge>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{(Number.isFinite(testCase.time) ? testCase.time : 0).toFixed(3)}s</span>
                      <span>{Number.isFinite(testCase.memory) ? testCase.memory : 0} KB</span>
                    </div>
                  </div>

                  {/* Always show details for all cases, passed or not, hidden or not */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-medium text-muted-foreground">Input:</span>
                      <pre className="bg-muted/20 p-2 rounded mt-1 overflow-x-auto">{testCase.input ?? ''}</pre>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Expected:</span>
                      <pre className="bg-muted/20 p-2 rounded mt-1 overflow-x-auto">{testCase.expectedOutput ?? ''}</pre>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Got:</span>
                      <pre className="bg-muted/20 p-2 rounded mt-1 overflow-x-auto">{testCase.actualOutput ?? (testCase as any).stdout ?? ''}</pre>
                    </div>
                    {testCase.stderr && (
                      <div>
                        <span className="font-medium text-red-400">Error:</span>
                        <pre className="bg-red-500/10 p-2 rounded mt-1 overflow-x-auto text-red-300">{testCase.stderr}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback Output (for legacy or simple results) */}
        {!hasDetailedResults && submissionResult.output && (
          <div>
            <h4 className="font-semibold text-primary mb-2">Output</h4>
            <pre className="bg-muted/20 p-4 rounded border text-sm overflow-x-auto whitespace-pre-wrap">
              {submissionResult.output}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BattleSubmissionResult;
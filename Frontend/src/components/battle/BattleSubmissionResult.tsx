import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SubmissionResult {
  verdict: string;
  output: string;
  executionTime?: string;
  memoryUsed?: string;
}

interface BattleSubmissionResultProps {
  submissionResult: SubmissionResult | null;
}

const BattleSubmissionResult = ({ submissionResult }: BattleSubmissionResultProps) => {
  if (!submissionResult) return null;
  const { verdict, executionTime, memoryUsed, output } = submissionResult;

  function professionalVerdictLabel(v: string): string {
    switch (v) {
      case 'Ran':
        return 'Code executed successfully';
      case 'Accepted':
        return 'All test cases passed';
      case 'Runtime Error':
        return 'Runtime error occurred';
      case 'Wrong Answer':
        return 'Wrong answer';
      case 'Error':
        return 'Execution failed';
      default:
        return v || 'Result';
    }
  }

  const isSuccess = verdict === 'Accepted' || verdict === 'Ran';
  return (
    <Card className="battle-card border-accent/30 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-accent">Verdict</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge
            variant={isSuccess ? 'default' : 'destructive'}
            className="text-lg px-4 py-2"
          >
            {professionalVerdictLabel(verdict)}
          </Badge>
          {executionTime && (
            <span className="text-muted-foreground">
              Time: {executionTime}
            </span>
          )}
          {memoryUsed && (
            <span className="text-muted-foreground">
              Memory: {memoryUsed}
            </span>
          )}
        </div>
        <div>
          <h4 className="font-semibold text-primary mb-2">Output</h4>
          <pre className="bg-muted/20 p-4 rounded border text-sm overflow-x-auto whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default BattleSubmissionResult;
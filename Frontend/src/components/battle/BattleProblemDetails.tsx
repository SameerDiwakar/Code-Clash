import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  inputSample: string;
  outputSample: string;
  constraints: string[];
}

interface BattleProblemDetailsProps {
  problem: Problem;
}

const BattleProblemDetails = ({ problem }: BattleProblemDetailsProps) => (
  <Card className="battle-card border-accent/30">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-accent">{problem.title}</CardTitle>
        <Badge
          variant={problem.difficulty === 'Easy' ? 'default' : problem.difficulty === 'Medium' ? 'secondary' : 'destructive'}
          className="animate-glow"
        >
          {problem.difficulty}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <h4 className="font-semibold text-primary mb-2">Description</h4>
        <p className="text-muted-foreground">{problem.description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-primary mb-2">Sample Input</h4>
          <code className="block bg-muted/20 p-3 rounded border text-sm">
            {problem.inputSample}
          </code>
        </div>
        <div>
          <h4 className="font-semibold text-primary mb-2">Sample Output</h4>
          <code className="block bg-muted/20 p-3 rounded border text-sm">
            {problem.outputSample}
          </code>
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-primary mb-2">Constraints</h4>
        <ul className="text-muted-foreground text-sm space-y-1">
          {problem.constraints.map((constraint, index) => (
            <li key={index}>• {constraint}</li>
          ))}
        </ul>
      </div>
    </CardContent>
  </Card>
);

export default BattleProblemDetails; 
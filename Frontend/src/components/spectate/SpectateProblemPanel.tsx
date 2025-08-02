import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  inputSample: string;
  outputSample: string;
  constraints: string[];
}

interface SpectateProblemPanelProps {
  problem: Problem;
}

const SpectateProblemPanel = ({ problem }: SpectateProblemPanelProps) => (
  <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg text-white">{problem.title}</CardTitle>
        <Badge
          variant={problem.difficulty === 'Easy' ? 'default' : problem.difficulty === 'Medium' ? 'secondary' : 'destructive'}
        >
          {problem.difficulty}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-4 overflow-y-auto max-h-[calc(100vh-300px)]">
      <div>
        <h4 className="font-semibold text-white mb-2">Description</h4>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {problem.description}
        </p>
      </div>
      <Separator className="bg-border/50" />
      <div>
        <h4 className="font-semibold text-white mb-2">Example</h4>
        <div className="bg-muted/20 p-3 rounded-md">
          <p className="text-sm">
            <span className="text-cyan-400">Input:</span> {problem.inputSample}
          </p>
          <p className="text-sm mt-1">
            <span className="text-cyan-400">Output:</span> {problem.outputSample}
          </p>
        </div>
      </div>
      <Separator className="bg-border/50" />
      <div>
        <h4 className="font-semibold text-white mb-2">Constraints</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          {problem.constraints.map((constraint, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              {constraint}
            </li>
          ))}
        </ul>
      </div>
    </CardContent>
  </Card>
);

export default SpectateProblemPanel; 
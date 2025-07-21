
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  inputSample: string;
  outputSample: string;
  constraints: string[];
}

interface ProblemCardProps {
  problem: Problem;
  isSelected: boolean;
  onClick: () => void;
}

export const ProblemCard = ({ problem, isSelected, onClick }: ProblemCardProps) => {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:scale-105 border",
        isSelected 
          ? "border-primary bg-primary/10 animate-glow" 
          : "border-muted/30 hover:border-primary/50 bg-muted/5"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm truncate">{problem.title}</h3>
          <Badge 
            variant={problem.difficulty === 'Easy' ? 'default' : 
                    problem.difficulty === 'Medium' ? 'secondary' : 'destructive'}
            className="text-xs"
          >
            {problem.difficulty}
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs line-clamp-2">
          {problem.description}
        </p>
      </CardContent>
    </Card>
  );
};

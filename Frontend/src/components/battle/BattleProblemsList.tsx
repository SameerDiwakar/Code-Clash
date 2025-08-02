import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { ProblemCard } from '@/components/index/ProblemCard';

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  inputSample: string;
  outputSample: string;
  constraints: string[];
}

interface BattleProblemsListProps {
  problems: Problem[];
  selectedProblemId: string;
  onSelect: (problem: Problem) => void;
}

const BattleProblemsList = ({ problems, selectedProblemId, onSelect }: BattleProblemsListProps) => (
  <div className="lg:col-span-1">
    <Card className="battle-card border-primary/30">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Battle Challenges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {problems.map((problem) => (
          <ProblemCard
            key={problem.id}
            problem={problem}
            isSelected={selectedProblemId === problem.id}
            onClick={() => onSelect(problem)}
          />
        ))}
      </CardContent>
    </Card>
  </div>
);

export default BattleProblemsList; 
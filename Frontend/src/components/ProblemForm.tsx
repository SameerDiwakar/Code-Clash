
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Hash } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  description: string;
  inputSample: string;
  outputSample: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface ProblemFormProps {
  problem: Problem;
  index: number;
  onUpdate: (updatedProblem: Partial<Problem>) => void;
  onRemove: () => void;
}

export const ProblemForm = ({ problem, index, onUpdate, onRemove }: ProblemFormProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'default';
      case 'Medium': return 'secondary';
      case 'Hard': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <Card className="border-muted/30 bg-muted/5">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            <span>Problem {index + 1}</span>
            <Badge variant={getDifficultyColor(problem.difficulty)}>
              {problem.difficulty}
            </Badge>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`title-${problem.id}`}>Problem Title</Label>
            <Input
              id={`title-${problem.id}`}
              value={problem.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="e.g., Two Sum"
              className="battle-glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`difficulty-${problem.id}`}>Difficulty</Label>
            <Select value={problem.difficulty} onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => onUpdate({ difficulty: value })}>
              <SelectTrigger id={`difficulty-${problem.id}`} className="battle-glow">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`description-${problem.id}`}>Problem Description</Label>
          <Textarea
            id={`description-${problem.id}`}
            value={problem.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Describe the problem in detail..."
            rows={4}
            className="battle-glow resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`input-${problem.id}`}>Sample Input</Label>
            <Textarea
              id={`input-${problem.id}`}
              value={problem.inputSample}
              onChange={(e) => onUpdate({ inputSample: e.target.value })}
              placeholder="Example input..."
              rows={3}
              className="battle-glow resize-none font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`output-${problem.id}`}>Expected Output</Label>
            <Textarea
              id={`output-${problem.id}`}
              value={problem.outputSample}
              onChange={(e) => onUpdate({ outputSample: e.target.value })}
              placeholder="Expected output..."
              rows={3}
              className="battle-glow resize-none font-mono text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

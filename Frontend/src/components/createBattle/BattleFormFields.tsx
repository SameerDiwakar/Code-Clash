import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BattleFormFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
  duration: string;
  setDuration: (value: string) => void;
  problemStatement: string;
  setProblemStatement: (value: string) => void;
}

const BattleFormFields = ({
  title,
  setTitle,
  description,
  setDescription,
  difficulty,
  setDifficulty,
  duration,
  setDuration,
  problemStatement,
  setProblemStatement,
}: BattleFormFieldsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Input
          type="text"
          placeholder="Battle Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
        />
      </div>
      <div>
        <Textarea
          placeholder="Brief Battle Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 resize-none"
        />
      </div>
      <div>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="bg-slate-800/50 border-slate-600">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Input
          type="number"
          placeholder="Duration in Minutes"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
        />
      </div>
      <div>
        <Textarea
          placeholder="Problem Statement"
          value={problemStatement}
          onChange={(e) => setProblemStatement(e.target.value)}
          className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 resize-none"
        />
      </div>
    </div>
  );
};

export default BattleFormFields;

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface BattleCustomInputProps {
  customInput: string;
  setCustomInput: (v: string) => void;
}

const BattleCustomInput = ({ customInput, setCustomInput }: BattleCustomInputProps) => (
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
);

export default BattleCustomInput; 
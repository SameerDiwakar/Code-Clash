import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface BattleSubmitButtonProps {
  onSubmit: () => void;
  isSubmitting: boolean;
  code: string;
}

const BattleSubmitButton = ({ onSubmit, isSubmitting, code }: BattleSubmitButtonProps) => (
  <div className="flex justify-center">
    <Button
      onClick={onSubmit}
      disabled={isSubmitting || !code.trim()}
      size="lg"
      className="bg-primary hover:bg-primary/90 text-primary-foreground animate-glow px-8 py-3 text-lg font-semibold"
    >
      <Play className="h-5 w-5 mr-2" />
      {isSubmitting ? 'Submitting...' : 'Submit Solution'}
    </Button>
  </div>
);

export default BattleSubmitButton; 
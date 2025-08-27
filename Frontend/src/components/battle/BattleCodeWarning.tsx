import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BattleCodeWarning = () => {
  return (
    <Alert className="border-yellow-500/30 bg-yellow-500/5">
      <AlertTriangle className="h-4 w-4 text-yellow-400" />
      <AlertDescription className="text-yellow-300">
        <strong>Important:</strong> Please adjust the class function name, parameters, and return type according to the problem requirements. 
        The current boilerplate is a template and may need modification to match the expected function signature.
      </AlertDescription>
    </Alert>
  );
};

export default BattleCodeWarning;

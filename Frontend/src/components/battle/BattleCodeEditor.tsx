import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CodeEditor } from '@/components/index/CodeEditor';
import { RefreshCw } from 'lucide-react';

interface BattleCodeEditorProps {
  code: string;
  setCode: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
  problemTitle?: string;
  problemDescription?: string;
  examples?: Array<{input: string; output: string}>;
}

interface LanguageInfo {
  id: string;
  name: string;
  boilerplate: string;
}

const BattleCodeEditor = ({
  code,
  setCode,
  language,
  setLanguage,
  problemTitle = 'solve',
  problemDescription = '',
  examples = []
}: BattleCodeEditorProps): JSX.Element => {
  const monacoLanguage = mapToMonacoLanguage(language);
  const [isResetting, setIsResetting] = useState(false);
  
  const defaultBoilerplates: Record<string, string> = {
    'python': 'def solve():\n    pass',
    'javascript': 'function solve() {\n    \n}',
    'java': 'public class Solution {\n    public static void main(String[] args) {\n        \n    }\n}',
    'c++': '#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}'
  };
  
  const handleReset = () => {
    setIsResetting(true);
    
    // First try to get boilerplate from backend
    axios.get<{languages: LanguageInfo[]}>('http://localhost:4000/api/languages', { withCredentials: true })
      .then(response => {
        const languages = response.data?.languages || [];
        const currentLang = languages.find(lang => lang.id === language);
        if (currentLang?.boilerplate) {
          setCode(currentLang.boilerplate);
        } else {
          // Fallback to default boilerplate if not found in backend
          setCode(defaultBoilerplates[language] || '');
        }
      })
      .catch(error => {
        console.error('Failed to fetch languages:', error);
        // Use default boilerplate if API call fails
        setCode(defaultBoilerplates[language] || '');
      })
      .finally(() => {
        setIsResetting(false);
      });
  };

  return (
    <Card className="battle-card border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary">Code Editor</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReset}
              disabled={isResetting}
              className="text-xs h-8 px-3 gap-1"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Resetting...' : 'Reset'}</span>
            </Button>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-48 bg-muted/20 border-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript (Node)</SelectItem>
                <SelectItem value="c++">C++</SelectItem>
                <SelectItem value="java">Java</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CodeEditor
          value={code}
          onChange={setCode}
          language={monacoLanguage}
        />
      </CardContent>
    </Card>
  );
};

function mapToMonacoLanguage(lang: string): string {
  switch (lang) {
    case 'python':
      return 'python';
    case 'javascript':
      return 'javascript';
    case 'c++':
      return 'cpp';
    case 'java':
      return 'java';
    default:
      return 'plaintext';
  }
}

export default BattleCodeEditor;
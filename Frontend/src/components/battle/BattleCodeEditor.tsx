import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CodeEditor } from '@/components/index/CodeEditor';

interface BattleCodeEditorProps {
  code: string;
  setCode: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
}

const BattleCodeEditor = ({ code, setCode, language, setLanguage }: BattleCodeEditorProps) => {
  const monacoLanguage = mapToMonacoLanguage(language);
  return (
    <Card className="battle-card border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary">Code Editor</CardTitle>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-48 bg-muted/20 border-primary/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python3">Python 3</SelectItem>
              <SelectItem value="javascript">JavaScript (Node)</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="c">C</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="go">Go</SelectItem>
              <SelectItem value="rust">Rust</SelectItem>
              <SelectItem value="csharp">C#</SelectItem>
              <SelectItem value="php">PHP</SelectItem>
              <SelectItem value="ruby">Ruby</SelectItem>
              <SelectItem value="kotlin">Kotlin</SelectItem>
              <SelectItem value="swift">Swift</SelectItem>
            </SelectContent>
          </Select>
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
    case 'python3':
      return 'python';
    case 'javascript':
      return 'javascript';
    case 'typescript':
      return 'typescript';
    case 'cpp':
      return 'cpp';
    case 'c':
      return 'c';
    case 'java':
      return 'java';
    case 'go':
      return 'go';
    case 'rust':
      return 'rust';
    case 'csharp':
      return 'csharp';
    case 'php':
      return 'php';
    case 'ruby':
      return 'ruby';
    case 'kotlin':
      return 'kotlin';
    case 'swift':
      return 'swift';
    default:
      return 'plaintext';
  }
}

export default BattleCodeEditor;
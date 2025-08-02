import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CodeEditor } from '@/components/index/CodeEditor';

interface BattleCodeEditorProps {
  code: string;
  setCode: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
}

const BattleCodeEditor = ({ code, setCode, language, setLanguage }: BattleCodeEditorProps) => (
  <Card className="battle-card border-primary/30">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-primary">Code Editor</CardTitle>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-40 bg-muted/20 border-primary/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardHeader>
    <CardContent>
      <CodeEditor
        value={code}
        onChange={setCode}
        language={language}
      />
    </CardContent>
  </Card>
);

export default BattleCodeEditor; 
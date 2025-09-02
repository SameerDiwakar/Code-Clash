import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import BattleCodeEditor from '../battle/BattleCodeEditor';

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
}

interface CodeEditorWithTestsProps {
  initialCode?: string;
  initialLanguage?: string;
  problemId: string;
  testCases: TestCase[];
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (language: string) => void;
}

const CodeEditorWithTests = ({
  initialCode = '',
  initialLanguage = 'python',
  problemId,
  testCases = [],
  onCodeChange,
  onLanguageChange,
}: CodeEditorWithTestsProps) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [customInput, setCustomInput] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (onCodeChange) onCodeChange(newCode);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (onLanguageChange) onLanguageChange(newLanguage);
  };

  const runTests = async () => {
    if (!code || !problemId) return;

    setIsRunning(true);
    setResults([]);
    setActiveTab('results');

    try {
      const response = await axios.post('http://localhost:4000/api/verify', {
        code,
        language,
        challengeId: problemId,
        functionName: 'solve',
        isLeetCodeStyle: true
      }, { withCredentials: true });

      if (response.data.results) {
        setResults(response.data.results);
      } else {
        setResults([{
          input: 'Test',
          expected: 'Expected output',
          actual: 'No results returned',
          passed: false,
          error: 'No test results returned from server'
        }]);
      }
    } catch (error: any) {
      console.error('Error running tests:', error);
      setResults([{
        input: 'Error',
        expected: 'Expected output',
        actual: error.response?.data?.error || 'Failed to run tests',
        passed: false,
        error: error.message
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const runWithCustomInput = async () => {
    if (!code || !customInput) return;

    setIsRunning(true);
    setActiveTab('custom');

    try {
      const response = await axios.post('http://localhost:4000/api/run', {
        code,
        language,
        input: customInput,
        functionName: 'solve',
        isLeetCodeStyle: true
      }, { withCredentials: true });

      setResults([{
        input: customInput,
        expected: 'Custom input result',
        actual: response.data.output || 'No output',
        passed: true,
      }]);
    } catch (error: any) {
      console.error('Error running with custom input:', error);
      setResults([{
        input: customInput,
        expected: 'Expected output',
        actual: error.response?.data?.error || 'Failed to run with custom input',
        passed: false,
        error: error.message
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="custom">Custom Input</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="flex-1 overflow-hidden">
          <div className="h-full">
            <BattleCodeEditor
              code={code}
              setCode={handleCodeChange}
              language={language}
              setLanguage={handleLanguageChange}
            />
          </div>
        </TabsContent>

        <TabsContent value="results" className="flex-1 overflow-auto">
          <div className="space-y-4 p-4">
            {isRunning ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Running tests...</span>
              </div>
            ) : results.length > 0 ? (
              results.map((result, index) => (
                <Card key={index} className={result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <CardHeader className="p-4">
                    <div className="flex items-center">
                      {result.passed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className="font-medium">Test Case {index + 1} {result.passed ? 'Passed' : 'Failed'}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    <div>
                      <Label>Input</Label>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                        {result.input}
                      </pre>
                    </div>
                    <div>
                      <Label>Expected</Label>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                        {result.expected}
                      </pre>
                    </div>
                    <div>
                      <Label>Output</Label>
                      <pre className={`mt-1 p-2 rounded text-sm overflow-auto ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                        {result.actual}
                      </pre>
                    </div>
                    {result.error && (
                      <div>
                        <Label>Error</Label>
                        <pre className="mt-1 p-2 bg-red-100 text-red-800 rounded text-sm overflow-auto">
                          {result.error}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center text-gray-500 p-8">
                No test results yet. Click "Run Tests" to execute your code against the test cases.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-input">Custom Input</Label>
              <Input
                id="custom-input"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter your test input here..."
                className="font-mono mt-1"
                disabled={isRunning}
              />
            </div>
            <Button 
              onClick={runWithCustomInput}
              disabled={!customInput || isRunning}
              className="w-full"
            >
              {isRunning ? 'Running...' : 'Run with Custom Input'}
            </Button>
            
            {results.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Output:</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto">
                  {results[0].actual}
                </pre>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="border-t p-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Language: <span className="font-medium">{language}</span>
        </div>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('custom')}
            disabled={isRunning}
          >
            Custom Input
          </Button>
          <Button 
            onClick={runTests}
            disabled={isRunning || !problemId}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isRunning ? 'Running...' : 'Run Tests'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorWithTests;

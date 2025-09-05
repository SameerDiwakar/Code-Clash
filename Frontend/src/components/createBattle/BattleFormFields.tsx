import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Calendar, Users, Tag, Wand2 } from 'lucide-react';
import { problemPresets } from '@/data/problemPresets';

interface Problem {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;
  constraints: string;
  examples: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  points: number;
}

interface BattleFormFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
  duration: string;
  setDuration: (value: string) => void;
  maxParticipants: string;
  setMaxParticipants: (value: string) => void;
  startTime: string;
  setStartTime: (value: string) => void;
  isPublic: boolean;
  setIsPublic: (value: boolean) => void;
  accessCode: string;
  setAccessCode: (value: string) => void;
  tags: string;
  setTags: (value: string) => void;
  problems: Problem[];
  updateProblem: (index: number, field: keyof Problem, value: any) => void;
  addProblem: () => void;
  removeProblem: (index: number) => void;
  addTestCase: (problemIndex: number) => void;
  removeTestCase: (problemIndex: number, testCaseIndex: number) => void;
  addExample: (problemIndex: number) => void;
  removeExample: (problemIndex: number, exampleIndex: number) => void;
  replaceProblem: (index: number, newProblem: Problem) => void;
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
  maxParticipants,
  setMaxParticipants,
  startTime,
  setStartTime,
  isPublic,
  setIsPublic,
  accessCode,
  setAccessCode,
  tags,
  setTags,
  problems,
  updateProblem,
  addProblem,
  removeProblem,
  addTestCase,
  removeTestCase,
  addExample,
  removeExample,
  replaceProblem,
}: BattleFormFieldsProps) => {
  // Duration inputs (Hours + Minutes)
  const totalMinutes = Math.max(0, parseInt(duration || '0') || 0);
  const hours = Math.min(12, Math.floor(totalMinutes / 60));
  const minutes = Math.min(59, totalMinutes % 60);

  const onHoursChange = (val: string) => {
    const h = Math.min(12, Math.max(0, parseInt(val || '0') || 0));
    const newTotal = h * 60 + minutes;
    setDuration(String(Math.min(720, newTotal)));
  };

  const onMinutesChange = (val: string) => {
    const m = Math.min(59, Math.max(0, parseInt(val || '0') || 0));
    const newTotal = hours * 60 + m;
    setDuration(String(Math.min(720, newTotal)));
  };

  // Autofill handler using presets
  const handleAutofill = (problemIndex: number) => {
    if (!problemPresets.length) return;
    const preset = problemPresets[Math.floor(Math.random() * problemPresets.length)];
    // Deep clone to avoid shared refs
    const clone = JSON.parse(JSON.stringify(preset));
    const mapped: Problem = {
      title: clone.title || '',
      description: clone.description || '',
      difficulty: clone.difficulty || 'Medium',
      constraints: clone.constraints || '',
      examples: Array.isArray(clone.examples) ? clone.examples.map((ex: any) => ({
        input: String(ex.input ?? ''),
        output: String(ex.output ?? ''),
        explanation: String(ex.explanation ?? ''),
      })) : [{ input: '', output: '', explanation: '' }],
      testCases: Array.isArray(clone.testCases) ? clone.testCases.map((tc: any) => ({
        input: String(tc.input ?? ''),
        expectedOutput: String(tc.expectedOutput ?? ''),
        isHidden: Boolean(tc.isHidden ?? false),
      })) : [{ input: '', expectedOutput: '', isHidden: false }],
      points: typeof clone.points === 'number' ? clone.points : 100,
    };
    replaceProblem(problemIndex, mapped);
  };
  return (
    <div className="space-y-8">
      {/* Basic Battle Information */}
      <Card className="bg-slate-800/30 border-slate-600">
        <CardHeader>
          <CardTitle className="text-purple-400 text-lg">Battle Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-slate-300">Battle Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter battle title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-slate-300">Description *</Label>
            <Textarea
              id="description"
              placeholder="Brief description of your battle"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 resize-none mt-1"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="difficulty" className="text-slate-300">Difficulty *</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600 mt-1">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">🟢 Easy</SelectItem>
                  <SelectItem value="Medium">🟡 Medium</SelectItem>
                  <SelectItem value="Hard">🔴 Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">Duration *</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <Input
                    type="number"
                    placeholder="0"
                    value={hours}
                    onChange={(e) => onHoursChange(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                    min={0}
                    max={12}
                  />
                  <span className="text-xs text-slate-400">Hours (0–12)</span>
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minutes}
                    onChange={(e) => onMinutesChange(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                    min={0}
                    max={59}
                  />
                  <span className="text-xs text-slate-400">Minutes (0–59)</span>
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-1">Current: {Math.min(720, totalMinutes)} minutes</div>
            </div>
            <div>
              <Label htmlFor="maxParticipants" className="text-slate-300">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                placeholder="100"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 mt-1"
                min="2"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime" className="text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start Time (optional)
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tags" className="text-slate-300 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags (comma-separated)
              </Label>
              <Input
                id="tags"
                type="text"
                placeholder="algorithms, data-structures, dynamic-programming"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 mt-1"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={isPublic}
                onCheckedChange={(checked) => {
                  setIsPublic(checked as boolean);
                  if (checked) setAccessCode(''); // Clear access code when making public
                }}
                className="border-slate-600"
              />
              <Label htmlFor="isPublic" className="text-slate-300">Make this battle public</Label>
            </div>
            
            {!isPublic && (
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-slate-300">
                  Access Code (required, 4-10 characters)
                </Label>
                <Input
                  id="accessCode"
                  type="text"
                  placeholder="Enter an access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  minLength={4}
                  maxLength={10}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                  required={!isPublic}
                />
                <p className="text-xs text-slate-400">
                  Share this code with others to let them join this private battle
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Problems Section */}
      <Card className="bg-slate-800/30 border-slate-600">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-purple-400 text-lg">Problems ({problems.length})</CardTitle>
          <Button
            type="button"
            onClick={addProblem}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Problem
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {problems.map((problem, problemIndex) => (
            <Card key={problemIndex} className="bg-slate-700/30 border-slate-500">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-cyan-400 text-base">
                  Problem {problemIndex + 1}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => handleAutofill(problemIndex)}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 ring-1 ring-purple-400/40 shadow-md shadow-purple-500/20 px-3 py-1.5 rounded-md"
                    title="Autofill with a random preset"
                    aria-label="Autofill problem with a random preset"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Autofill
                  </Button>
                  {problems.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeProblem(problemIndex)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Problem Title *</Label>
                    <Input
                      type="text"
                      placeholder="e.g., Two Sum"
                      value={problem.title}
                      onChange={(e) => updateProblem(problemIndex, 'title', e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Difficulty *</Label>
                    <Select
                      value={problem.difficulty}
                      onValueChange={(value) => updateProblem(problemIndex, 'difficulty', value)}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">🟢 Easy</SelectItem>
                        <SelectItem value="Medium">🟡 Medium</SelectItem>
                        <SelectItem value="Hard">🔴 Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">Problem Description *</Label>
                  <Textarea
                    placeholder="Describe the problem statement..."
                    value={problem.description}
                    onChange={(e) => updateProblem(problemIndex, 'description', e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 resize-none mt-1"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Constraints</Label>
                    <Textarea
                      placeholder="e.g., 1 <= nums.length <= 10^4"
                      value={problem.constraints}
                      onChange={(e) => updateProblem(problemIndex, 'constraints', e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 resize-none mt-1"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Points</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={problem.points}
                      onChange={(e) => updateProblem(problemIndex, 'points', parseInt(e.target.value) || 100)}
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 mt-1"
                      min="1"
                    />
                  </div>
                </div>

                {/* Examples */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-slate-300">Examples</Label>
                    <Button
                      type="button"
                      onClick={() => addExample(problemIndex)}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Example
                    </Button>
                  </div>
                  {problem.examples.map((example, exampleIndex) => (
                    <Card key={exampleIndex} className="bg-slate-600/30 border-slate-500 mb-2">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-400">Example {exampleIndex + 1}</span>
                          {problem.examples.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeExample(problemIndex, exampleIndex)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <Input
                            placeholder="Input"
                            value={example.input}
                            onChange={(e) => {
                              const updatedExamples = [...problem.examples];
                              updatedExamples[exampleIndex].input = e.target.value;
                              updateProblem(problemIndex, 'examples', updatedExamples);
                            }}
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 text-sm"
                          />
                          <Input
                            placeholder="Output"
                            value={example.output}
                            onChange={(e) => {
                              const updatedExamples = [...problem.examples];
                              updatedExamples[exampleIndex].output = e.target.value;
                              updateProblem(problemIndex, 'examples', updatedExamples);
                            }}
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 text-sm"
                          />
                          <Input
                            placeholder="Explanation (optional)"
                            value={example.explanation}
                            onChange={(e) => {
                              const updatedExamples = [...problem.examples];
                              updatedExamples[exampleIndex].explanation = e.target.value;
                              updateProblem(problemIndex, 'examples', updatedExamples);
                            }}
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 text-sm"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Test Cases */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="space-y-1">
                      <Label className="text-slate-300">Test Cases</Label>
                      <p className="text-xs text-slate-400">At least 2 test cases are required</p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => addTestCase(problemIndex)}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Test Case
                    </Button>
                  </div>
                  {problem.testCases.map((testCase, testCaseIndex) => (
                    <Card key={testCaseIndex} className="bg-slate-600/30 border-slate-500 mb-2">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-400">Test Case {testCaseIndex + 1}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`hidden-${problemIndex}-${testCaseIndex}`}
                                checked={testCase.isHidden}
                                onCheckedChange={(checked) => {
                                  const updatedTestCases = [...problem.testCases];
                                  updatedTestCases[testCaseIndex].isHidden = checked as boolean;
                                  updateProblem(problemIndex, 'testCases', updatedTestCases);
                                }}
                                className="border-slate-600"
                              />
                              <Label htmlFor={`hidden-${problemIndex}-${testCaseIndex}`} className="text-xs text-slate-400">
                                Hidden
                              </Label>
                            </div>
                            <Button
                              type="button"
                              onClick={() => removeTestCase(problemIndex, testCaseIndex)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                              disabled={problem.testCases.length <= 2}
                              title={problem.testCases.length <= 2 ? "At least 2 test cases are required" : "Remove test case"}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <Input
                            placeholder="Input"
                            value={testCase.input}
                            onChange={(e) => {
                              const updatedTestCases = [...problem.testCases];
                              updatedTestCases[testCaseIndex].input = e.target.value;
                              updateProblem(problemIndex, 'testCases', updatedTestCases);
                            }}
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 text-sm"
                          />
                          <Input
                            placeholder="Expected Output"
                            value={testCase.expectedOutput}
                            onChange={(e) => {
                              const updatedTestCases = [...problem.testCases];
                              updatedTestCases[testCaseIndex].expectedOutput = e.target.value;
                              updateProblem(problemIndex, 'testCases', updatedTestCases);
                            }}
                            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 text-sm"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default BattleFormFields;

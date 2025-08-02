import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CodeEditor } from '@/components/index/CodeEditor';

interface Participant {
  id: string;
  username: string;
  avatar: string;
  code: string;
  language: string;
  submissionTime: string;
  verdict: string;
  executionTime?: string;
  memoryUsed?: string;
  testsPassed?: number;
  totalTests?: number;
}

interface SpectateSubmissionsPanelProps {
  participants: Participant[];
  selectedParticipant: number;
  setSelectedParticipant: (index: number) => void;
  getVerdictColor: (verdict: string) => string;
  getVerdictIcon: (verdict: string) => JSX.Element;
}

const SpectateSubmissionsPanel = ({
  participants,
  selectedParticipant,
  setSelectedParticipant,
  getVerdictColor,
  getVerdictIcon
}: SpectateSubmissionsPanelProps) => (
  <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg text-white">Submissions</CardTitle>
        <div className="flex gap-2">
          {participants.map((participant, index) => (
            <Button
              key={participant.id}
              variant={selectedParticipant === index ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedParticipant(index)}
              className="flex items-center gap-2"
            >
              <span>{participant.avatar}</span>
              <span>{participant.username}</span>
            </Button>
          ))}
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {participants[selectedParticipant] && (
        <>
          {/* Participant Info */}
          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{participants[selectedParticipant].avatar}</span>
              <div>
                <div className="font-semibold text-white">{participants[selectedParticipant].username}</div>
                <div className="text-sm text-muted-foreground">
                  Submitted {participants[selectedParticipant].submissionTime}
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-2 font-semibold ${getVerdictColor(participants[selectedParticipant].verdict)}`}>
              {getVerdictIcon(participants[selectedParticipant].verdict)}
              {participants[selectedParticipant].verdict}
            </div>
          </div>
          {/* Code Editor */}
          <div className="h-96">
            <CodeEditor
              value={participants[selectedParticipant].code}
              onChange={() => {}} // Read-only
              language={participants[selectedParticipant].language}
            />
          </div>
          {/* Results */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/20 p-3 rounded-md text-center">
              <div className="text-sm text-muted-foreground">Execution Time</div>
              <div className="font-semibold text-white">{participants[selectedParticipant].executionTime}</div>
            </div>
            <div className="bg-muted/20 p-3 rounded-md text-center">
              <div className="text-sm text-muted-foreground">Memory</div>
              <div className="font-semibold text-white">{participants[selectedParticipant].memoryUsed}</div>
            </div>
            <div className="bg-muted/20 p-3 rounded-md text-center">
              <div className="text-sm text-muted-foreground">Tests Passed</div>
              <div className="font-semibold text-white">
                {participants[selectedParticipant].testsPassed}/{participants[selectedParticipant].totalTests}
              </div>
            </div>
            <div className="bg-muted/20 p-3 rounded-md text-center">
              <div className="text-sm text-muted-foreground">Language</div>
              <div className="font-semibold text-white capitalize">{participants[selectedParticipant].language}</div>
            </div>
          </div>
        </>
      )}
    </CardContent>
  </Card>
);

export default SpectateSubmissionsPanel; 
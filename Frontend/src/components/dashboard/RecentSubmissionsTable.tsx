import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Submission {
  id: string;
  challenge: string;
  status: 'Success' | 'Failed' | 'Pending';
  language: string;
  time: string;
}

interface RecentSubmissionsTableProps {
  submissions: Submission[];
}

const RecentSubmissionsTable = ({ submissions }: RecentSubmissionsTableProps) => (
  <div className="mb-12">
    <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
      Recent Submissions
    </h2>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-800/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
              Challenge
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
              Language
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {submissions.map((submission) => (
            <tr key={submission.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{submission.challenge}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {submission.status === 'Success' && (
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Success
                  </div>
                )}
                {submission.status === 'Failed' && (
                  <div className="flex items-center text-red-400">
                    <XCircle className="h-4 w-4 mr-1" />
                    Failed
                  </div>
                )}
                {submission.status === 'Pending' && (
                  <div className="flex items-center text-yellow-400">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Pending
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{submission.language}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{submission.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default RecentSubmissionsTable; 
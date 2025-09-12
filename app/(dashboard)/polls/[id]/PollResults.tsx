'use client';

import { useEffect, useState } from 'react';
import { getPollResults, getPollById } from '@/lib/actions/poll-actions';
import { Poll } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PollResultsProps {
  pollId: string;
}

export default function PollResults({ pollId }: PollResultsProps) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [results, setResults] = useState<Record<number, number> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPollAndResults = async () => {
      const { poll, error: pollError } = await getPollById(pollId);
      if (pollError) {
        setError(pollError);
        return;
      }
      setPoll(poll as Poll);

      const { results, error: resultsError } = await getPollResults(pollId);
      if (resultsError) {
        setError(resultsError);
      } else {
        setResults(results);
      }
    };

    fetchPollAndResults();
  }, [pollId]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!poll || !results) {
    return <div>Loading...</div>;
  }

  const totalVotes = Object.values(results).reduce((acc, count) => acc + count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{poll.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-4 mt-4">
          {poll.options.map((option, index) => {
            const count = results[index] || 0;
            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
            return (
              <li key={index}>
                <div className="flex justify-between">
                  <span>{option.text}</span>
                  <span>{count} vote(s)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

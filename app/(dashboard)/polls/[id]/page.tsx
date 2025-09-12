"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPollById, submitVote } from "@/app/lib/actions/poll-actions";
import { toast } from "sonner";
import PollResults from "./PollResults";

// ----------------------
// Type Definitions
// ----------------------
type PollOption = {
  text: string;
  votes: number;
};

type Poll = {
  id: string;
  title: string;
  options: PollOption[];
  createdAt: string;
};

// ----------------------
// Component
// ----------------------
interface PollDetailPageProps {
  params: { id: string };
}

export default function PollDetailPage({ params }: PollDetailPageProps) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchPoll = async () => {
      const { poll: fetchedPoll, error } = await getPollById(params.id);
      if (error) {
        console.error(error);
        toast.error("Failed to fetch poll.");
        return;
      }
      setPoll(fetchedPoll as Poll);
    };
    fetchPoll();
  }, [params.id]);

  const handleVote = async () => {
    if (selectedOption === null || !poll) return;

    setIsSubmitting(true);

    const { error } = await submitVote(poll.id, selectedOption);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Vote submitted successfully!");
      setShowResults(true);
    }

    setIsSubmitting(false);
  };

  if (!poll) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/polls" className="text-blue-600 hover:underline">
          &larr; Back to Polls
        </Link>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/polls/${params.id}/edit`}>Edit Poll</Link>
          </Button>
          <Button
            variant="outline"
            className="text-red-500 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{poll.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {poll.options.map((option: PollOption, index: number) => (
              <div
                key={index}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedOption === index
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-slate-50"
                }`}
                onClick={() => setSelectedOption(index)}
              >
                {option.text}
              </div>
            ))}
            <Button
              onClick={handleVote}
              disabled={selectedOption === null || isSubmitting}
              className="mt-4"
            >
              {isSubmitting ? "Submitting..." : "Submit Vote"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-slate-500 flex justify-between">
          <span>
            Created on {new Date(poll.createdAt).toLocaleDateString()}
          </span>
        </CardFooter>
      </Card>

      {showResults && <PollResults pollId={poll.id} />}

      <div className="pt-4">
        <h2 className="text-xl font-semibold mb-4">Share this poll</h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1">
            Copy Link
          </Button>
          <Button variant="outline" className="flex-1">
            Share on Twitter
          </Button>
        </div>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { useAuth } from "@/app/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { deletePoll } from "@/app/lib/actions/poll-actions";

interface Poll {
  id: string;
  question: string;
  options: any[];
  user_id: string;
}

/**
 * Props for the PollActions component.
 */
interface PollActionsProps {
  /** The poll data to display and manage. */
  poll: Poll;
  /** Child components to be rendered, such as the share component. */
  children: React.ReactNode;
}

/**
 * A component that displays a poll's details and provides actions for the owner.
 *
 * This client component shows the poll question and number of options.
 * If the currently authenticated user is the owner of the poll, it displays
 * "Edit" and "Delete" buttons, along with any children components passed to it.
 *
 * @param poll - The poll data to display and manage.
 * @param children - React nodes to be rendered within the component, typically for sharing.
 * @returns The JSX for the poll actions component.
 */
export default function PollActions({ poll, children }: PollActionsProps) {
  const { user } = useAuth();

  /**
   * Handles the deletion of the poll after user confirmation.
   */
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this poll?")) {
      await deletePoll(poll.id);
      window.location.reload(); // Refresh the page to reflect the deletion.
    }
  };

  return (
    <div className="border rounded-md shadow-md hover:shadow-lg transition-shadow bg-white">
      <Link href={`/polls/${poll.id}`}>
        <div className="group p-4">
          <div className="h-full">
            <div>
              <h2 className="group-hover:text-blue-600 transition-colors font-bold text-lg">
                {poll.question}
              </h2>
              <p className="text-slate-500">{poll.options.length} options</p>
            </div>
          </div>
        </div>
      </Link>
      {/* Show action buttons and children only if the user is the poll owner. */}
      {user && user.id === poll.user_id && (
        <div className="border-t p-4 space-y-4">
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/polls/${poll.id}/edit`}>Edit</Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </div>
          {children}
        </div>
      )}
    </div>
  );
}
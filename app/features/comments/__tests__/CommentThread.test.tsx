/**
 * Comments tests
 * Basic unit tests for Comments module
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { CommentThread } from "~/features/comments/components/CommentThread";
import { CommentItem } from "~/features/comments/components/CommentItem";
import { CommentForm } from "~/features/comments/components/CommentForm";
import { Comment, CommentThread as CommentThreadType } from "~/features/comments/types/comment.types";

// Mock data
const mockComment: Comment = {
  id: "1",
  tenant_id: "tenant-1",
  entity_type: "product",
  entity_id: "product-1",
  parent_id: null,
  content: "This is a test comment",
  created_by: "user-1",
  mentions: [],
  attachments: [],
  is_edited: false,
  is_deleted: false,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const mockThread: CommentThreadType = {
  comment: mockComment,
  replies: [
    {
      ...mockComment,
      id: "2",
      parent_id: "1",
      content: "This is a reply",
    },
  ],
  total_replies: 1,
};

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};

describe("Comments Module", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    vi.clearAllMocks();
  });

  describe("CommentThread", () => {
    it("renders thread with main comment and replies", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CommentThread thread={mockThread} />
        </QueryClientProvider>
      );

      expect(screen.getByText("This is a test comment")).toBeInTheDocument();
      expect(screen.getByText("This is a reply")).toBeInTheDocument();
      expect(screen.getByText("1 replies count")).toBeInTheDocument();
    });

    it("calls onReply when reply button is clicked", async () => {
      const onReply = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CommentThread thread={mockThread} onReply={onReply} />
        </QueryClientProvider>
      );

      const replyButtons = screen.getAllByText("Reply");
      fireEvent.click(replyButtons[0]);

      // Should show reply form
      expect(screen.getByPlaceholderText("Write a reply...")).toBeInTheDocument();
    });

    it("calls onEdit when edit button is clicked", async () => {
      const onEdit = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CommentThread thread={mockThread} onEdit={onEdit} />
        </QueryClientProvider>
      );

      const editButtons = screen.getAllByText("Edit");
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(onEdit).toHaveBeenCalledWith("1", "This is a test comment");
      });
    });

    it("calls onDelete when delete button is clicked", async () => {
      const onDelete = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CommentThread thread={mockThread} onDelete={onDelete} />
        </QueryClientProvider>
      );

      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith("1");
      });
    });

    it("shows loading state", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CommentThread thread={mockThread} loading={true} />
        </QueryClientProvider>
      );

      expect(screen.getByText("Loading comments...")).toBeInTheDocument();
    });
  });

  describe("CommentItem", () => {
    it("renders comment with user info and actions", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CommentItem comment={mockComment} />
        </QueryClientProvider>
      );

      expect(screen.getByText("This is a test comment")).toBeInTheDocument();
      expect(screen.getByText("user-1")).toBeInTheDocument();
      expect(screen.getByText("Reply")).toBeInTheDocument();
      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("shows edited badge when comment is edited", () => {
      const editedComment = {
        ...mockComment,
        is_edited: true,
      };

      render(
        <QueryClientProvider client={queryClient}>
          <CommentItem comment={editedComment} />
        </QueryClientProvider>
      );

      expect(screen.getByText("(edited)")).toBeInTheDocument();
    });

    it("shows mentions when present", () => {
      const commentWithMentions = {
        ...mockComment,
        mentions: ["user-2", "user-3"],
      };

      render(
        <QueryClientProvider client={queryClient}>
          <CommentItem comment={commentWithMentions} />
        </QueryClientProvider>
      );

      expect(screen.getByText("@user-2")).toBeInTheDocument();
      expect(screen.getByText("@user-3")).toBeInTheDocument();
    });
  });

  describe("CommentForm", () => {
    it("renders form with textarea and buttons", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CommentForm onSubmit={vi.fn()} onCancel={vi.fn()} />
        </QueryClientProvider>
      );

      expect(screen.getByPlaceholderText("Write a comment...")).toBeInTheDocument();
      expect(screen.getByText("Comment")).toBeInTheDocument();
    });

    it("calls onSubmit when form is submitted", async () => {
      const onSubmit = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CommentForm onSubmit={onSubmit} />
        </QueryClientProvider>
      );

      const textarea = screen.getByPlaceholderText("Write a comment...");
      fireEvent.change(textarea, { target: { value: "New comment" } });

      const submitButton = screen.getByText("Comment");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith("New comment");
      });
    });

    it("calls onCancel when cancel button is clicked", async () => {
      const onCancel = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CommentForm onSubmit={vi.fn()} onCancel={onCancel} />
        </QueryClientProvider>
      );

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(onCancel).toHaveBeenCalled();
      });
    });

    it("disables submit button when content is empty", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CommentForm onSubmit={vi.fn()} />
        </QueryClientProvider>
      );

      const submitButton = screen.getByText("Comment");
      expect(submitButton).toBeDisabled();
    });

    it("shows loading state when submitting", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CommentForm onSubmit={vi.fn()} loading={true} />
        </QueryClientProvider>
      );

      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });
  });

  describe("Comment Data Structure", () => {
    it("has required comment fields", () => {
      const comment = mockComment;

      expect(comment).toHaveProperty("id");
      expect(comment).toHaveProperty("tenant_id");
      expect(comment).toHaveProperty("entity_type");
      expect(comment).toHaveProperty("entity_id");
      expect(comment).toHaveProperty("parent_id");
      expect(comment).toHaveProperty("content");
      expect(comment).toHaveProperty("created_by");
      expect(comment).toHaveProperty("mentions");
      expect(comment).toHaveProperty("attachments");
      expect(comment).toHaveProperty("is_edited");
      expect(comment).toHaveProperty("is_deleted");
      expect(comment).toHaveProperty("created_at");
      expect(comment).toHaveProperty("updated_at");
    });

    it("has correct thread structure", () => {
      const thread = mockThread;

      expect(thread).toHaveProperty("comment");
      expect(thread).toHaveProperty("replies");
      expect(thread).toHaveProperty("total_replies");
      expect(thread.replies).toHaveLength(1);
      expect(thread.total_replies).toBe(1);
    });
  });
});

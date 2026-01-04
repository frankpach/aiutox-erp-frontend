/**
 * Approvals hooks
 * Provides TanStack Query hooks for approvals module
 * Following frontend-api.md rules
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  listApprovalFlows, 
  getApprovalFlow, 
  createApprovalFlow, 
  updateApprovalFlow, 
  deleteApprovalFlow,
  listApprovalRequests,
  getApprovalRequest,
  createApprovalRequest,
  updateApprovalRequest,
  deleteApprovalRequest,
  approveRequest,
  rejectRequest,
  delegateRequest,
} from "~/features/approvals/api/approvals.api";
import type { 
  ApprovalFlowCreate, 
  ApprovalFlowUpdate, 
  ApprovalFlowListParams,
  ApprovalRequestCreate,
  ApprovalRequestUpdate,
  ApprovalRequestListParams,
  ApprovalDecision,
} from "~/features/approvals/types/approval.types";

// Approval Flow Query hooks
export function useApprovalFlows(params?: ApprovalFlowListParams) {
  return useQuery({
    queryKey: ["approval-flows", params],
    queryFn: () => listApprovalFlows(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

export function useApprovalFlow(id: string) {
  return useQuery({
    queryKey: ["approval-flows", id],
    queryFn: () => getApprovalFlow(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: !!id,
  });
}

// Approval Request Query hooks
export function useApprovalRequests(params?: ApprovalRequestListParams) {
  return useQuery({
    queryKey: ["approval-requests", params],
    queryFn: () => listApprovalRequests(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

export function useApprovalRequest(id: string) {
  return useQuery({
    queryKey: ["approval-requests", id],
    queryFn: () => getApprovalRequest(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: !!id,
  });
}

// Approval Flow Mutation hooks
export function useCreateApprovalFlow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createApprovalFlow,
    onSuccess: () => {
      // Invalidate approval flows list queries
      void queryClient.invalidateQueries({ queryKey: ["approval-flows"] });
    },
    onError: (error) => {
      console.error("Failed to create approval flow:", error);
    },
  });
}

export function useUpdateApprovalFlow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ApprovalFlowUpdate }) =>
      updateApprovalFlow(id, payload),
    onSuccess: (_, variables) => {
      // Invalidate specific flow and list queries
      void queryClient.invalidateQueries({ queryKey: ["approval-flows"] });
      void queryClient.invalidateQueries({ queryKey: ["approval-flows", variables.id] });
    },
    onError: (error) => {
      console.error("Failed to update approval flow:", error);
    },
  });
}

export function useDeleteApprovalFlow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteApprovalFlow,
    onSuccess: () => {
      // Invalidate approval flows list queries
      void queryClient.invalidateQueries({ queryKey: ["approval-flows"] });
    },
    onError: (error) => {
      console.error("Failed to delete approval flow:", error);
    },
  });
}

// Approval Request Mutation hooks
export function useCreateApprovalRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createApprovalRequest,
    onSuccess: () => {
      // Invalidate approval requests list queries
      void queryClient.invalidateQueries({ queryKey: ["approval-requests"] });
    },
    onError: (error) => {
      console.error("Failed to create approval request:", error);
    },
  });
}

export function useUpdateApprovalRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ApprovalRequestUpdate }) =>
      updateApprovalRequest(id, payload),
    onSuccess: (_, variables) => {
      // Invalidate specific request and list queries
      void queryClient.invalidateQueries({ queryKey: ["approval-requests", variables.id] });
      void queryClient.invalidateQueries({ queryKey: ["approval-requests"] });
    },
    onError: (error) => {
      console.error("Failed to update approval request:", error);
    },
  });
}

export function useDeleteApprovalRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteApprovalRequest,
    onSuccess: () => {
      // Invalidate approval requests list queries
      void queryClient.invalidateQueries({ queryKey: ["approval-requests"] });
    },
    onError: (error) => {
      console.error("Failed to delete approval request:", error);
    },
  });
}

// Approval Action hooks
export function useApprovalActions() {
  const queryClient = useQueryClient();
  
  const approve = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ApprovalDecision }) =>
      approveRequest(id, payload),
    onSuccess: (_, variables) => {
      // Invalidate specific request and list queries
      void queryClient.invalidateQueries({ queryKey: ["approval-requests", variables.id] });
      void queryClient.invalidateQueries({ queryKey: ["approval-requests"] });
    },
    onError: (error) => {
      console.error("Failed to approve request:", error);
    },
  });

  const reject = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ApprovalDecision }) =>
      rejectRequest(id, payload),
    onSuccess: (_, variables) => {
      // Invalidate specific request and list queries
      void queryClient.invalidateQueries({ queryKey: ["approval-requests", variables.id] });
      void queryClient.invalidateQueries({ queryKey: ["approval-requests"] });
    },
    onError: (error) => {
      console.error("Failed to reject request:", error);
    },
  });

  const delegate = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ApprovalDecision }) =>
      delegateRequest(id, payload),
    onSuccess: (_, variables) => {
      // Invalidate specific request and list queries
      void queryClient.invalidateQueries({ queryKey: ["approval-requests", variables.id] });
      void queryClient.invalidateQueries({ queryKey: ["approval-requests"] });
    },
    onError: (error) => {
      console.error("Failed to delegate request:", error);
    },
  });

  return {
    approve,
    reject,
    delegate,
  };
}

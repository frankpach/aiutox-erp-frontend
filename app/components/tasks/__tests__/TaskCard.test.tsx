import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskCard } from '../TaskCard';
import { Task, TaskStatus, TaskPriority } from '@/types/tasks';
import { format } from 'date-fns';

// Mock de date-fns
jest.mock('date-fns', () => ({
  format: jest.fn(() => '01/01/2026'),
}));

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

describe('TaskCard Component', () => {
  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    assigned_to_id: 'user-1',
    created_by_id: 'user-2',
    tenant_id: 'tenant-1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    due_date: '2026-01-15T00:00:00Z',
    assigned_to: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
    },
    created_by: {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
  };

  const defaultProps = {
    task: mockTask,
    onStatusChange: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onAssign: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task information correctly', () => {
    render(<TaskCard {...defaultProps} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('01/01/2026')).toBeInTheDocument();
  });

  it('displays correct status badge', () => {
    render(<TaskCard {...defaultProps} />);
    
    const statusBadge = screen.getByTestId('task-status');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveTextContent('Por Hacer');
  });

  it('displays correct priority indicator', () => {
    render(<TaskCard {...defaultProps} />);
    
    const priorityIndicator = screen.getByTestId('task-priority');
    expect(priorityIndicator).toBeInTheDocument();
    expect(priorityIndicator).toHaveClass('priority-medium');
  });

  it('shows overdue indicator for overdue tasks', () => {
    const overdueTask = {
      ...mockTask,
      due_date: '2025-12-01T00:00:00Z', // Past date
    };
    
    render(<TaskCard {...defaultProps} task={overdueTask} />);
    
    expect(screen.getByTestId('overdue-indicator')).toBeInTheDocument();
  });

  it('calls onStatusChange when status is changed', async () => {
    const { onStatusChange } = defaultProps;
    
    render(<TaskCard {...defaultProps} />);
    
    const statusSelect = screen.getByTestId('status-select');
    fireEvent.change(statusSelect, { target: { value: TaskStatus.IN_PROGRESS } });
    
    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith('task-1', TaskStatus.IN_PROGRESS);
    });
  });

  it('calls onEdit when edit button is clicked', () => {
    const { onEdit } = defaultProps;
    
    render(<TaskCard {...defaultProps} />);
    
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);
    
    expect(onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const { onDelete } = defaultProps;
    
    render(<TaskCard {...defaultProps} />);
    
    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);
    
    // Confirm deletion in modal
    const confirmButton = screen.getByTestId('confirm-delete');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith('task-1');
    });
  });

  it('calls onAssign when assign button is clicked', async () => {
    const { onAssign } = defaultProps;
    
    render(<TaskCard {...defaultProps} />);
    
    const assignButton = screen.getByTestId('assign-button');
    fireEvent.click(assignButton);
    
    // Select user in assign modal
    const userSelect = screen.getByTestId('user-select');
    fireEvent.change(userSelect, { target: { value: 'user-3' } });
    
    const confirmButton = screen.getByTestId('confirm-assign');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(onAssign).toHaveBeenCalledWith('task-1', 'user-3');
    });
  });

  it('displays completion percentage for tasks with checklist', () => {
    const taskWithChecklist = {
      ...mockTask,
      checklist_items: [
        { id: 'item-1', completed: true },
        { id: 'item-2', completed: false },
      ],
    };
    
    render(<TaskCard {...defaultProps} task={taskWithChecklist} />);
    
    expect(screen.getByTestId('completion-percentage')).toBeInTheDocument();
    expect(screen.getByTestId('completion-percentage')).toHaveTextContent('50%');
  });

  it('shows tags when task has tags', () => {
    const taskWithTags = {
      ...mockTask,
      tags: ['urgent', 'frontend'],
    };
    
    render(<TaskCard {...defaultProps} task={taskWithTags} />);
    
    expect(screen.getByTestId('tag-urgent')).toBeInTheDocument();
    expect(screen.getByTestId('tag-frontend')).toBeInTheDocument();
  });

  it('displays correct color when color_override is set', () => {
    const taskWithColor = {
      ...mockTask,
      color_override: '#FF5733',
    };
    
    render(<TaskCard {...defaultProps} task={taskWithColor} />);
    
    const taskHeader = screen.getByTestId('task-header');
    expect(taskHeader).toHaveStyle('border-left-color: #FF5733');
  });

  it('shows estimated duration when set', () => {
    const taskWithDuration = {
      ...mockTask,
      estimated_duration: 120, // 2 hours in minutes
    };
    
    render(<TaskCard {...defaultProps} task={taskWithDuration} />);
    
    expect(screen.getByTestId('estimated-duration')).toBeInTheDocument();
    expect(screen.getByTestId('estimated-duration')).toHaveTextContent('2h');
  });

  it('handles keyboard navigation', () => {
    render(<TaskCard {...defaultProps} />);
    
    const taskCard = screen.getByTestId('task-card');
    
    // Tab navigation
    fireEvent.keyDown(taskCard, { key: 'Tab' });
    expect(taskCard).toHaveFocus();
    
    // Enter to edit
    fireEvent.keyDown(taskCard, { key: 'Enter' });
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('shows loading state during operations', async () => {
    render(<TaskCard {...defaultProps} loading={true} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByTestId('task-card')).toBeDisabled();
  });

  it('displays error message when provided', () => {
    render(<TaskCard {...defaultProps} error="Failed to load task" />);
    
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to load task');
  });

  it('is accessible', async () => {
    const { container } = render(<TaskCard {...defaultProps} />);
    
    // Check ARIA attributes
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument();
    
    // Check keyboard navigation
    const taskCard = screen.getByTestId('task-card');
    expect(taskCard).toHaveAttribute('tabIndex', '0');
  });
});

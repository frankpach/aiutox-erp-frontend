import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '../TaskForm';

// Define missing enums
const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const;

const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

// Mock de react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(),
    handleSubmit: vi.fn((fn: any) => fn),
    formState: { errors: {} },
    setValue: vi.fn(),
    getValues: vi.fn(),
    reset: vi.fn(),
    watch: vi.fn(),
  }),
}));

// Mock de react-datepicker
vi.mock('react-datepicker', () => {
  return function MockDatePicker({ onChange, value }: any) {
    return (
      <input
        data-testid="date-picker"
        type="date"
        value={value || ''}
        onChange={(e) => onChange(new Date(e.target.value))}
      />
    );
  };
});

describe('TaskForm Component', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    loading: false,
    users: [
      { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
      { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
    ],
    tags: ['urgent', 'frontend', 'backend'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<TaskForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/estado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prioridad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/asignado a/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha de vencimiento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/etiquetas/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const { onSubmit } = defaultProps;
    
    render(<TaskForm {...defaultProps} />);
    
    // Fill form fields
    await user.type(screen.getByLabelText(/título/i), 'New Task');
    await user.type(screen.getByLabelText(/descripción/i), 'Task Description');
    await user.selectOptions(screen.getByLabelText(/estado/i), TaskStatus.TODO);
    await user.selectOptions(screen.getByLabelText(/prioridad/i), TaskPriority.HIGH);
    await user.selectOptions(screen.getByLabelText(/asignado a/i), 'user-1');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /guardar/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          description: 'Task Description',
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          assigned_to_id: 'user-1',
        })
      );
    });
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    
    render(<TaskForm {...defaultProps} />);
    
    // Submit empty form
    await user.click(screen.getByRole('button', { name: /guardar/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/el título es requerido/i)).toBeInTheDocument();
    });
  });

  it('validates title length', async () => {
    const user = userEvent.setup();
    
    render(<TaskForm {...defaultProps} />);
    
    // Type title that's too long
    await user.type(screen.getByLabelText(/título/i), 'a'.repeat(201));
    await user.click(screen.getByRole('button', { name: /guardar/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/el título no puede exceder 200 caracteres/i)).toBeInTheDocument();
    });
  });

  it('validates description length', async () => {
    const user = userEvent.setup();
    
    render(<TaskForm {...defaultProps} />);
    
    // Type description that's too long
    await user.type(screen.getByLabelText(/descripción/i), 'a'.repeat(2001));
    await user.click(screen.getByRole('button', { name: /guardar/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/la descripción no puede exceder 2000 caracteres/i)).toBeInTheDocument();
    });
  });

  it('handles date selection', async () => {
    const user = userEvent.setup();
    
    render(<TaskForm {...defaultProps} />);
    
    const datePicker = screen.getByTestId('date-picker');
    await user.type(datePicker, '2026-12-31');
    
    expect(datePicker).toHaveValue('2026-12-31');
  });

  it('validates date range', async () => {
    const user = userEvent.setup();
    
    render(<TaskForm {...defaultProps} />);
    
    // Set start date after end date
    const startDate = screen.getByLabelText(/fecha de inicio/i);
    const endDate = screen.getByLabelText(/fecha de fin/i);
    
    await user.type(startDate, '2026-12-31');
    await user.type(endDate, '2026-01-01');
    
    await user.click(screen.getByRole('button', { name: /guardar/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/la fecha de inicio no puede ser posterior a la fecha de fin/i)).toBeInTheDocument();
    });
  });

  it('handles tag selection', async () => {
    const user = userEvent.setup();
    
    render(<TaskForm {...defaultProps} />);
    
    // Select tags
    await user.click(screen.getByText('urgent'));
    await user.click(screen.getByText('frontend'));
    
    expect(screen.getByTestId('selected-tags')).toBeInTheDocument();
    expect(screen.getByTestId('tag-urgent')).toBeInTheDocument();
    expect(screen.getByTestId('tag-frontend')).toBeInTheDocument();
  });

  it('handles custom tag creation', async () => {
    const user = userEvent.setup();
    
    render(<TaskForm {...defaultProps} />);
    
    // Add custom tag
    const tagInput = screen.getByPlaceholderText(/agregar etiqueta/i);
    await user.type(tagInput, 'custom-tag');
    await user.keyboard('{Enter}');
    
    expect(screen.getByTestId('tag-custom-tag')).toBeInTheDocument();
  });

  it('handles estimated duration input', async () => {
    const user = userEvent.setup();
    
    render(<TaskForm {...defaultProps} />);
    
    const durationInput = screen.getByLabelText(/duración estimada/i);
    await user.type(durationInput, '4');
    
    expect(durationInput).toHaveValue(4);
  });

  it('validates estimated duration', async () => {
    const user = userEvent.setup();
    
    render(<TaskForm {...defaultProps} />);
    
    const durationInput = screen.getByLabelText(/duración estimada/i);
    await user.type(durationInput, '-1');
    await user.click(screen.getByRole('button', { name: /guardar/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/la duración debe ser mayor a 0/i)).toBeInTheDocument();
    });
  });

  it('handles color selection', async () => {
    const user = userEvent.setup();
    
    render(<TaskForm {...defaultProps} />);
    
    const colorPicker = screen.getByTestId('color-picker');
    await user.click(colorPicker);
    
    // Select a color
    const colorOption = screen.getByTestId('color-#FF5733');
    await user.click(colorOption);
    
    expect(colorPicker).toHaveValue('#FF5733');
  });

  it('handles category selection', async () => {
    const user = userEvent.setup();
    
    render(<TaskForm {...defaultProps} />);
    
    await user.selectOptions(screen.getByLabelText(/categoría/i), 'development');
    
    expect(screen.getByDisplayValue('development')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<TaskForm {...defaultProps} loading={true} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar/i })).toBeDisabled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const { onCancel } = defaultProps;
    
    render(<TaskForm {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    
    expect(onCancel).toHaveBeenCalled();
  });

  it('resets form when reset button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<TaskForm {...defaultProps} />);
    
    // Fill form
    await user.type(screen.getByLabelText(/título/i), 'Test Task');
    
    // Reset form
    await user.click(screen.getByRole('button', { name: /limpiar/i }));
    
    expect(screen.getByLabelText(/título/i)).toHaveValue('');
  });

  it('pre-fills form when editing existing task', () => {
    const existingTask = {
      id: 'task-1',
      title: 'Existing Task',
      description: 'Existing Description',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assigned_to_id: 'user-1',
      due_date: '2026-12-31',
      tags: ['urgent'],
      estimated_duration: 2,
      category: 'development',
      color_override: '#FF5733',
      tenant_id: 'tenant-1',
      created_by_id: 'user-1',
      checklist: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    
    render(<TaskForm {...defaultProps} task={existingTask} />);
    
    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue(TaskStatus.IN_PROGRESS)).toBeInTheDocument();
    expect(screen.getByDisplayValue(TaskPriority.HIGH)).toBeInTheDocument();
    expect(screen.getByDisplayValue('user-1')).toBeInTheDocument();
  });

  it('handles file attachments', async () => {
    const user = userEvent.setup();
    
    render(<TaskForm {...defaultProps} />);
    
    const fileInput = screen.getByLabelText(/adjuntar archivos/i);
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    await user.upload(fileInput, file);
    
    expect(screen.getByTestId('file-test.txt')).toBeInTheDocument();
  });

  it('validates file types', async () => {
    const user = userEvent.setup();
    
    render(<TaskForm {...defaultProps} />);
    
    const fileInput = screen.getByLabelText(/adjuntar archivos/i);
    const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
    
    await user.upload(fileInput, invalidFile);
    
    await waitFor(() => {
      expect(screen.getByText(/tipo de archivo no permitido/i)).toBeInTheDocument();
    });
  });

  it('validates file sizes', async () => {
    const user = userEvent.setup();
    
    render(<TaskForm {...defaultProps} />);
    
    const fileInput = screen.getByLabelText(/adjuntar archivos/i);
    // Mock large file (11MB)
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.txt', { type: 'text/plain' });
    
    await user.upload(fileInput, largeFile);
    
    await waitFor(() => {
      expect(screen.getByText(/el archivo excede el tamaño máximo/i)).toBeInTheDocument();
    });
  });

  it('is accessible', async () => {
    render(<TaskForm {...defaultProps} />);
    
    // Check form labels
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    
    // Check ARIA attributes
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    
    // Check keyboard navigation
    const titleInput = screen.getByLabelText(/título/i);
    titleInput.focus();
    expect(titleInput).toHaveFocus();
  });

  it('handles keyboard shortcuts', async () => {
    const user = userEvent.setup();
    const { onSubmit } = defaultProps;
    
    render(<TaskForm {...defaultProps} />);
    
    // Fill form
    await user.type(screen.getByLabelText(/título/i), 'Test Task');
    
    // Submit with Ctrl+Enter
    await user.keyboard('{Control>}{Enter}');
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('shows confirmation dialog on cancel with unsaved changes', async () => {
    const user = userEvent.setup();
    const { onCancel } = defaultProps;
    
    render(<TaskForm {...defaultProps} />);
    
    // Make changes
    await user.type(screen.getByLabelText(/título/i), 'Test Task');
    
    // Try to cancel
    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    
    // Confirm cancellation
    await user.click(screen.getByRole('button', { name: /confirmar/i }));
    
    expect(onCancel).toHaveBeenCalled();
  });
});

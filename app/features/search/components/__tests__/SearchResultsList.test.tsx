import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SearchResultsList } from "../SearchResultsList";
import { type SearchResultItem } from "../../api/search.api";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

// Mock the formatDistanceToNow function
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn().mockReturnValue('2 days ago'),
}));

// Mock the useTranslation hook
vi.mock('~/lib/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock the useToast hook
vi.mock('~/hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the debounce function
vi.mock('use-debounce', () => ({
  useDebounce: (value: any) => [value, value],
}));

describe("SearchResultsList", () => {
  const mockResults: SearchResultItem[] = [
    {
      id: "1",
      type: "document",
      title: "Test Document",
      description: "This is a test document",
      url: "/documents/1",
      updatedAt: new Date().toISOString(),
      metadata: {
        author: "Test User",
        status: "active"
      },
      score: 0.95
    },
    {
      id: "2",
      type: "user",
      title: "Test User",
      description: "Test User Description",
      url: "/users/2",
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      metadata: {
        role: "Admin",
        department: "IT"
      },
      score: 0.85
    }
  ];

  const defaultProps = {
    results: [],
    isLoading: false,
    isFetchingMore: false,
    hasMore: false,
    searchQuery: "test",
    onSearch: vi.fn(),
    onLoadMore: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    render(
      <MemoryRouter>
        <SearchResultsList {...defaultProps} isLoading={true} />
      </MemoryRouter>
    );
    expect(screen.getByTestId("search-results-loading")).toBeInTheDocument();
  });

  it("renders empty state when no results", () => {
    render(
      <MemoryRouter>
        <SearchResultsList {...defaultProps} results={[]} />
      </MemoryRouter>
    );
    expect(screen.getByTestId("no-results-message")).toBeInTheDocument();
  });

  it("renders search results with correct data", () => {
    render(
      <MemoryRouter>
        <SearchResultsList {...defaultProps} results={mockResults} />
      </MemoryRouter>
    );
    
    // Check if all result items are rendered
    expect(screen.getByText("Test Document")).toBeInTheDocument();
    expect(screen.getByText("This is a test document")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("Test User Description")).toBeInTheDocument();
    
    // Check if type badges are rendered with translated text
    expect(screen.getByText("search.types.document")).toBeInTheDocument();
    expect(screen.getByText("search.types.user")).toBeInTheDocument();
    
    // Check if dates are formatted
    expect(formatDistanceToNow).toHaveBeenCalledTimes(2);
  });

  it("calls onLoadMore when load more button is clicked", () => {
    const onLoadMore = vi.fn();
    render(
      <MemoryRouter>
        <SearchResultsList 
          {...defaultProps} 
          results={mockResults}
          hasMore={true}
          onLoadMore={onLoadMore}
        />
      </MemoryRouter>
    );
    
    const loadMoreButton = screen.getByTestId("load-more-button");
    expect(loadMoreButton).toBeInTheDocument();
    
    fireEvent.click(loadMoreButton);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
  
  it("calls onSearch when search query changes", async () => {
    const onSearch = vi.fn();
    render(
      <MemoryRouter>
        <SearchResultsList 
          {...defaultProps} 
          onSearch={onSearch}
          searchQuery=""
        />
      </MemoryRouter>
    );
    
    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'new query' } });
    
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('new query');
    });
  });
  
  it("handles keyboard navigation", () => {
    render(
      <MemoryRouter>
        <SearchResultsList {...defaultProps} results={mockResults} />
      </MemoryRouter>
    );
    
    // Get all the result items
    const items = screen.getAllByRole('option');
    
    // First item should be focused by default
    expect(items[0]).toHaveAttribute('aria-selected', 'true');
    
    // Simulate down arrow key on the first item
    fireEvent.keyDown(items[0], { key: 'ArrowDown' });
    expect(items[1]).toHaveAttribute('aria-selected', 'true');
    
    // Simulate up arrow key on the second item
    fireEvent.keyDown(items[1], { key: 'ArrowUp' });
    expect(items[0]).toHaveAttribute('aria-selected', 'true');
  });
  
  it("displays loading more indicator when fetching more results", () => {
    render(
      <MemoryRouter>
        <SearchResultsList
          {...defaultProps}
          results={mockResults}
          isFetchingMore={true}
          hasMore={true}
        />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId("loading-more-indicator")).toBeInTheDocument();
  });
  
  it("displays result metadata when available", () => {
    render(
      <MemoryRouter>
        <SearchResultsList {...defaultProps} results={[mockResults[0]]} />
      </MemoryRouter>
    );
    
    // Verificar que los metadatos estén presentes
    expect(screen.getByText("author")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("status")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
    
    // Verificar el puntaje (el formato real en el DOM es con un espacio después del %)
    expect(screen.getByText('95 % search.match')).toBeInTheDocument();
  });
  
  it("displays score when available", () => {
    render(
      <MemoryRouter>
        <SearchResultsList {...defaultProps} results={[mockResults[0]]} />
      </MemoryRouter>
    );
    
    // Verificar que el puntaje esté presente
    // El formato real en el DOM es con un espacio después del %
    expect(screen.getByText('95 % search.match')).toBeInTheDocument();
    
    // Verificar que el componente de puntuación esté presente
    const scoreElement = screen.getByText('95').closest('span');
    expect(scoreElement).toBeInTheDocument();
    expect(scoreElement).toHaveTextContent('95 % search.match');
  });
  
  it("applies custom class name", () => {
    // Render with a custom class name and some results
    const { container } = render(
      <MemoryRouter>
        <SearchResultsList 
          {...defaultProps} 
          results={mockResults} 
          className="custom-class" 
        />
      </MemoryRouter>
    );
    
    // The custom class should be on the main container div
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('custom-class');
    expect(mainContainer).toHaveClass('space-y-4');
  });
});

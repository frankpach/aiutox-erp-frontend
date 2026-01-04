import { render, screen, fireEvent } from "@testing-library/react";
import { SearchHeader } from "../SearchHeader";

describe("SearchHeader", () => {
  const mockOnSearch = jest.fn();
  const mockOnClear = jest.fn();
  
  beforeEach(() => {
    mockOnSearch.mockClear();
    mockOnClear.mockClear();
  });

  it("renders search input with placeholder", () => {
    render(
      <SearchHeader 
        searchQuery="" 
        onSearch={mockOnSearch} 
        onClear={mockOnClear} 
      />
    );
    
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("calls onSearch when form is submitted", () => {
    render(
      <SearchHeader 
        searchQuery="test" 
        onSearch={mockOnSearch} 
        onClear={mockOnClear} 
      />
    );
    
    const form = screen.getByRole("search");
    fireEvent.submit(form);
    
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it("shows clear button when searchQuery is not empty", () => {
    render(
      <SearchHeader 
        searchQuery="test" 
        onSearch={mockOnSearch} 
        onClear={mockOnClear} 
      />
    );
    
    const clearButton = screen.getByRole("button", { name: /clear search/i });
    expect(clearButton).toBeInTheDocument();
  });

  it("calls onClear when clear button is clicked", () => {
    render(
      <SearchHeader 
        searchQuery="test" 
        onSearch={mockOnSearch} 
        onClear={mockOnClear} 
      />
    );
    
    const clearButton = screen.getByRole("button", { name: /clear search/i });
    fireEvent.click(clearButton);
    
    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  it("shows result count when provided", () => {
    render(
      <SearchHeader 
        searchQuery="test" 
        onSearch={mockOnSearch} 
        onClear={mockOnClear}
        resultCount={5}
      />
    );
    
    expect(screen.getByText(/5 results for/i)).toBeInTheDocument();
  });

  it("shows no results message when resultCount is 0", () => {
    render(
      <SearchHeader 
        searchQuery="test" 
        onSearch={mockOnSearch} 
        onClear={mockOnClear}
        resultCount={0}
      />
    );
    
    expect(screen.getByText(/no results found for/i)).toBeInTheDocument();
  });
});

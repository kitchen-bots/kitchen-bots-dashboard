import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DataGrid } from './DataGrid';
import { ColumnDef } from '@tanstack/react-table';

type Person = {
  id: string;
  name: string;
  age: number;
};

const data: Person[] = [
  { id: '1', name: 'John Doe', age: 30 },
  { id: '2', name: 'Jane Smith', age: 25 },
];

const columns: ColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'age', header: 'Age' },
];

describe('DataGrid Component', () => {
  it('renders columns and data correctly', () => {
    render(<DataGrid data={data} columns={columns} />);
    
    // Check headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    
    // Check data
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('shows empty state when data is empty', () => {
    render(<DataGrid data={[]} columns={columns} />);
    expect(screen.getByText('No Results Found')).toBeInTheDocument(); // Adjust to your actual empty state text
  });

  it('shows loading state when isLoading is true', () => {
    render(<DataGrid data={[]} columns={columns} isLoading />);
    // Check for a skeleton or loading indicator. The exact text/role depends on your implementation.
    // E.g., if there is a loading spinner or "Loading..." text:
    expect(screen.getByText('Loading data...')).toBeInTheDocument(); // Adjust this based on your LoadingState component
  });
});

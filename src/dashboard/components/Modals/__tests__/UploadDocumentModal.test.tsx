import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadDocumentModal } from '../UploadDocumentModal';

describe('UploadDocumentModal', () => {
  beforeEach(() => {
    // Mock URL.createObjectURL
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  it('does not render when isOpen is false', () => {
    render(
      <UploadDocumentModal
        isOpen={false}
        onClose={vi.fn()}
        onUploadSuccess={vi.fn()}
      />
    );
    expect(screen.queryByText('Upload Asset Document')).not.toBeInTheDocument();
  });

  it('renders modal with title and controls when isOpen is true', () => {
    render(
      <UploadDocumentModal
        isOpen={true}
        onClose={vi.fn()}
        onUploadSuccess={vi.fn()}
      />
    );
    expect(screen.getByText('Upload Asset Document')).toBeInTheDocument();
    expect(screen.getByText('Click to select file or drag and drop')).toBeInTheDocument();
    expect(screen.getByLabelText(/Document Title/)).toBeInTheDocument();
  });

  it('shows error if submitted without a file', async () => {
    render(
      <UploadDocumentModal
        isOpen={true}
        onClose={vi.fn()}
        onUploadSuccess={vi.fn()}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Upload Document/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Please select a document file to upload.')
      ).toBeInTheDocument();
    });
  });

  it('allows file selection and calls onUploadSuccess upon submission', async () => {
    const handleUploadSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <UploadDocumentModal
        isOpen={true}
        onClose={handleClose}
        onUploadSuccess={handleUploadSuccess}
      />
    );

    const fakeFile = new File(['test document content'], 'Sample_Spec_Sheet.pdf', {
      type: 'application/pdf',
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    await userEvent.upload(fileInput, fakeFile);

    // Title should be auto-populated with file name
    const titleInput = screen.getByLabelText(/Document Title/) as HTMLInputElement;
    expect(titleInput.value).toBe('Sample_Spec_Sheet.pdf');

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Upload Document/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleUploadSuccess).toHaveBeenCalledTimes(1);
      expect(handleUploadSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Sample_Spec_Sheet.pdf',
          type: 'MANUAL',
          file: fakeFile,
          url: 'blob:mock-url',
        })
      );
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  it('closes when Cancel is clicked', async () => {
    const handleClose = vi.fn();
    render(
      <UploadDocumentModal
        isOpen={true}
        onClose={handleClose}
        onUploadSuccess={vi.fn()}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/adminClient', () => ({
  adminFetch: vi.fn(),
  getApiBaseUrl: () => 'https://test.workers.dev',
  getAuthToken: async () => null,
}));

import { adminFetch } from '../../api/adminClient';
import { documentService } from '../documentService';

const mockFetch = adminFetch as ReturnType<typeof vi.fn>;

const SAMPLE_DOCS = [
  {
    id: 'doc-1',
    title: 'BBQ Smoker Maintenance Guide',
    type: 'Manual',
    url: 'https://example.com/doc1.pdf',
    relatedOrderId: 'ORD-1001',
    relatedProductId: 'prod-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'doc-2',
    title: 'Commercial Oven Invoice',
    type: 'Invoice',
    url: 'https://example.com/doc2.pdf',
    createdAt: new Date().toISOString(),
  },
];

describe('documentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve documents from backend', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_DOCS });
    const response = await documentService.getDocuments();
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBe(2);
    expect(response.total).toBe(2);
  });

  it('should filter documents by search query', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_DOCS });
    const response = await documentService.getDocuments({ search: 'BBQ' });
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBe(1);
    expect(response.data[0].title).toContain('BBQ');
  });

  it('should filter documents by type', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_DOCS });
    const response = await documentService.getDocuments({ type: 'Invoice' });
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.every((d) => d.type === 'Invoice')).toBe(true);
  });

  it('should get documents by related order ID', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_DOCS });
    const response = await documentService.getDocumentsByOrderId('ORD-1001');
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBe(1);
    expect(response.data[0].relatedOrderId).toBe('ORD-1001');
  });

  it('should get documents by related product ID', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_DOCS });
    const response = await documentService.getDocumentsByProductId('prod-1');
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBe(1);
    expect(response.data[0].relatedProductId).toBe('prod-1');
  });

  it('should delete a document', async () => {
    mockFetch.mockResolvedValueOnce({ success: true });
    await expect(documentService.deleteDocument('doc-1')).resolves.toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      '/v1/admin/documents/doc-1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

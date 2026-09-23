import { describe, it, expect } from 'vitest';
import { documentService } from '../documentService';

describe('documentService', () => {
  it('should retrieve documents with fallback data when backend is unconfigured', async () => {
    const response = await documentService.getDocuments();
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.total).toBeGreaterThan(0);
  });

  it('should filter documents by search query', async () => {
    const response = await documentService.getDocuments({ search: 'BBQ' });
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0].title).toContain('BBQ');
  });

  it('should filter documents by type', async () => {
    const response = await documentService.getDocuments({ type: 'Invoice' });
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.every((d) => d.type === 'Invoice')).toBe(true);
  });

  it('should get documents by related order ID', async () => {
    const response = await documentService.getDocumentsByOrderId('ORD-1001');
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0].relatedOrderId).toBe('ORD-1001');
  });

  it('should get documents by related product ID', async () => {
    const response = await documentService.getDocumentsByProductId('prod-1');
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0].relatedProductId).toBe('prod-1');
  });

  it('should delete a document', async () => {
    const initial = await documentService.getDocuments();
    const countBefore = initial.total;

    await documentService.deleteDocument('doc-5');

    const updated = await documentService.getDocuments();
    expect(updated.total).toBe(countBefore - 1);
  });
});

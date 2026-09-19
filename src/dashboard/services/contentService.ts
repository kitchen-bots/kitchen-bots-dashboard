import { PaginationParams, PaginatedResponse } from './types';

export interface ContentItem {
  id: string;
  title: string;
  type: 'Page' | 'Blog' | 'Banner';
  status: 'Published' | 'Draft' | 'Archived';
  author: string;
  createdAt: string;
  updatedAt: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_CONTENT: ContentItem[] = [
  { id: 'c_1', title: 'About Us', type: 'Page', status: 'Published', author: 'Admin User', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'c_2', title: 'Spring Sale 2026', type: 'Banner', status: 'Published', author: 'Marketing', createdAt: '2026-02-15T10:00:00Z', updatedAt: '2026-02-15T10:00:00Z' },
  { id: 'c_3', title: 'Top 5 Industrial Mixers', type: 'Blog', status: 'Draft', author: 'John Doe', createdAt: '2026-05-20T14:30:00Z', updatedAt: '2026-05-21T09:15:00Z' }
];

export const contentService = {
  getContent: async (params?: PaginationParams): Promise<PaginatedResponse<ContentItem>> => {
    await delay(500);
    let filtered = [...MOCK_CONTENT];

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(c => c.title.toLowerCase().includes(q) || c.author.toLowerCase().includes(q));
    }
    if (params?.type) {
      filtered = filtered.filter(c => c.type === params.type);
    }
    if (params?.status) {
      filtered = filtered.filter(c => c.status === params.status);
    }

    const total = filtered.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      filtered = filtered.slice(start, start + params.limit);
    }
    return { data: filtered, total };
  },

  getContentById: async (id: string): Promise<ContentItem> => {
    await delay(300);
    const content = MOCK_CONTENT.find(c => c.id === id);
    if (!content) throw new Error('Content not found');
    return { ...content };
  },

  createContent: async (content: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentItem> => {
    await delay(600);
    const newContent: ContentItem = {
      ...content,
      id: `c_${MOCK_CONTENT.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_CONTENT.push(newContent);
    return { ...newContent };
  },

  updateContent: async (id: string, updates: Partial<ContentItem>): Promise<ContentItem> => {
    await delay(500);
    const index = MOCK_CONTENT.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Content not found');
    MOCK_CONTENT[index] = { ...MOCK_CONTENT[index], ...updates, updatedAt: new Date().toISOString() };
    return { ...MOCK_CONTENT[index] };
  },

  deleteContent: async (id: string): Promise<void> => {
    await delay(400);
    const index = MOCK_CONTENT.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Content not found');
    MOCK_CONTENT.splice(index, 1);
  }
};

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class UploadService {
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    // Simulate multi-step upload
    if (onProgress) {
      for (let i = 10; i <= 90; i += 20) {
        await delay(200);
        onProgress(i);
      }
    } else {
      await delay(1000); // Base network latency
    }
    
    if (onProgress) onProgress(100);

    // Simulate returning S3/CDN URL
    return {
      url: `https://storage.kitchenbots.com/uploads/${Date.now()}_${file.name}`,
      filename: file.name,
      size: file.size,
      type: file.type
    };
  }

  async uploadMultiple(files: File[], onProgress?: (progress: number) => void): Promise<UploadResponse[]> {
    const totalFiles = files.length;
    let completed = 0;
    
    const uploads = files.map(async (file) => {
      const response = await this.uploadFile(file);
      completed++;
      if (onProgress) {
        onProgress(Math.round((completed / totalFiles) * 100));
      }
      return response;
    });

    return Promise.all(uploads);
  }
}

export const uploadService = new UploadService();

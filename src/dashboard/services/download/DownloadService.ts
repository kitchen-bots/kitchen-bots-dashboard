import { eventBus } from '../events/EventBus';
import { LoggerService } from '../logger/LoggerService';

export class DownloadService {
  static downloadFile(url: string, filename?: string): void {
    try {
      const anchor = document.createElement('a');
      anchor.href = url;
      if (filename) {
        anchor.download = filename;
      }
      anchor.target = '_blank';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      
      LoggerService.info(`Triggered download for ${filename || url}`);
    } catch (error) {
      LoggerService.error('Failed to trigger download', error);
      eventBus.publish('ToastTriggered', {
        id: Math.random().toString(36).substring(2, 9),
        title: 'Download Failed',
        description: 'Failed to initiate the file download.',
        type: 'error'
      });
    }
  }

  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    this.downloadFile(url, filename);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }

  static downloadJson(data: any, filename: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    this.downloadBlob(blob, filename);
  }

  static downloadCsv(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, filename);
  }
}

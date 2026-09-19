/// <reference types="vite/client" />
/**
 * Base API Adapter for Google Apps Script
 */

export interface GasPayload {
  module: string;
  action: string;
  id?: string;
  data?: any;
}

export const api = {
  request: async <T>(payload: GasPayload): Promise<T> => {
    const url = import.meta.env.VITE_GAS_WEB_APP_URL;
    if (!url) {
      console.warn("GAS Web App URL is missing. Please set VITE_GAS_WEB_APP_URL in .env");
      throw new Error("No VITE_GAS_WEB_APP_URL configured");
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        // Use text/plain to avoid CORS preflight (OPTIONS) request, which GAS does not support well out of the box
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'API request failed');
      }

      return result.data as T;
    } catch (error) {
      console.error("[GAS API Error]", error);
      throw error;
    }
  }
};

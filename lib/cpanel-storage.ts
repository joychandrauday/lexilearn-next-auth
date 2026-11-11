/**
 * OwlCDN Storage Client for Next.js / TypeScript
 * Compatible with Vercel Server Actions, Route Handlers, and Node.js
 */

export interface UploadOptions {
  folder?: string;
}

export interface UploadResponse {
  success: boolean;
  url: string;
  path: string;
  filename: string;
  size: number;
  mime: string;
  project: string;
  folder: string;
  error?: string;
}

export interface DeleteResponse {
  success: boolean;
  message?: string;
  path?: string;
  error?: string;
}

export interface ListResponse {
  success: boolean;
  project: string;
  folder: string;
  total: number;
  files: Array<{
    filename: string;
    url: string;
    path: string;
    size: number;
    modified: number;
  }>;
  error?: string;
}

export class OwlCDNStorage {
  private baseUrl: string;
  private apiKey: string;

  constructor(options?: { baseUrl?: string; apiKey?: string }) {
    this.baseUrl = (
      options?.baseUrl ||
      process.env.OWL_CDN_BASE_URL ||
      'https://cdn.growwithowl.com'
    ).replace(/\/$/, '');

    this.apiKey =
      options?.apiKey ||
      process.env.OWL_CDN_API_KEY ||
      '';

    if (!this.apiKey) {
      console.warn('[OwlCDN] Warning: OWL_CDN_API_KEY is not configured.');
    }
  }

  /**
   * Upload a file (Buffer, Blob, or File) to OwlCDN
   */
  async upload(
    file: File | Blob | Buffer,
    filename: string,
    options?: UploadOptions
  ): Promise<UploadResponse> {
    const formData = new FormData();

    // Copy the Buffer into a plain Uint8Array so it is a valid BlobPart in
    // environments where Buffer is backed by a SharedArrayBuffer.
    const blob =
      typeof Buffer !== 'undefined' && Buffer.isBuffer(file)
        ? new Blob([new Uint8Array(file)])
        : (file as Blob);

    formData.append('file', blob, filename);

    if (options?.folder) {
      formData.append('folder', options.folder);
    }

    const res = await fetch(`${this.baseUrl}/api/v1/upload.php`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || `Upload failed with HTTP status ${res.status}`);
    }

    return data as UploadResponse;
  }

  /**
   * Delete a file by its URL or relative path
   */
  async delete(urlOrPath: string): Promise<DeleteResponse> {
    const res = await fetch(`${this.baseUrl}/api/v1/delete.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ path: urlOrPath }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || `Delete failed with HTTP status ${res.status}`);
    }

    return data as DeleteResponse;
  }

  /**
   * List files in a project folder
   */
  async list(folder: string = 'uploads'): Promise<ListResponse> {
    const res = await fetch(
      `${this.baseUrl}/api/v1/list.php?folder=${encodeURIComponent(folder)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || `List failed with HTTP status ${res.status}`);
    }

    return data as ListResponse;
  }
}

// Export singleton instance for convenience
export const owlCDN = new OwlCDNStorage();

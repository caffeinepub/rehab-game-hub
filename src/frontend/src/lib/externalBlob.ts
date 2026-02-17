import { ExternalBlob } from '@/backend';

/**
 * Converts ExternalBlob bytes to an object URL for rendering images
 * Remember to revoke the URL when the component unmounts to prevent memory leaks
 */
export async function blobToObjectURL(blob: ExternalBlob): Promise<string> {
  const bytes = await blob.getBytes();
  const imageBlob = new Blob([bytes], { type: 'image/jpeg' });
  return URL.createObjectURL(imageBlob);
}

/**
 * Creates an ExternalBlob from a File object (for uploads)
 */
export async function fileToExternalBlob(file: File): Promise<ExternalBlob> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  return ExternalBlob.fromBytes(uint8Array);
}

/**
 * Hook-friendly wrapper for converting blob to URL with cleanup
 */
export function useBlobURL(blob: ExternalBlob | null): string | null {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }

    let objectUrl: string | null = null;

    blobToObjectURL(blob).then((newUrl) => {
      objectUrl = newUrl;
      setUrl(newUrl);
    });

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [blob]);

  return url;
}

// Note: Import React for the hook
import React from 'react';

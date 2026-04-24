import { FirestoreError } from 'firebase/firestore';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export async function fetchWithRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const isOfflineError = 
      error.code === 'unavailable' || 
      error.message?.includes('offline') ||
      error.message?.includes('network');

    if (isOfflineError && retries > 0) {
      console.warn(`Firestore operation failed (offline/unavailable). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(operation, retries - 1, delay * 2); // Exponential backoff
    }

    throw error;
  }
}

import { db } from '@/db';
import { connectorCache } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
};

export class ConnectorError extends Error {
  constructor(
    message: string,
    public readonly connectorName: string,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'ConnectorError';
  }
}

/**
 * Retry logic for connector operations
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  connectorName: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on non-retryable errors
      if (error instanceof ConnectorError && !error.retryable) {
        throw error;
      }

      // Don't retry on 4xx errors except 429
      if (error instanceof Error && error.message.includes('status: 4')) {
        if (!error.message.includes('429')) {
          throw new ConnectorError(
            `Non-retryable error: ${error.message}`,
            connectorName,
            false
          );
        }
      }

      // If this was the last attempt, throw
      if (attempt === config.maxRetries) {
        break;
      }

      // Exponential backoff
      const delay = config.baseDelayMs * Math.pow(2, attempt);
      console.log(
        `[${connectorName}] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new ConnectorError(
    `Failed after ${config.maxRetries + 1} attempts: ${lastError?.message}`,
    connectorName,
    false
  );
}

/**
 * Cache management for connector responses
 */
export async function getCachedData<T>(
  connectorName: string,
  cacheKey: string
): Promise<T | null> {
  try {
    const cached = await db
      .select()
      .from(connectorCache)
      .where(
        and(
          eq(connectorCache.connectorName, connectorName),
          eq(connectorCache.cacheKey, cacheKey),
          gt(connectorCache.expiresAt, new Date())
        )
      )
      .limit(1);

    if (cached.length > 0) {
      console.log(`[${connectorName}] Cache hit for key: ${cacheKey}`);
      return cached[0].payload as T;
    }

    return null;
  } catch (error) {
    console.error(`[${connectorName}] Cache read error:`, error);
    return null;
  }
}

export async function setCachedData<T>(
  connectorName: string,
  cacheKey: string,
  data: T,
  ttlHours: number = 6
): Promise<void> {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttlHours);

    await db
      .insert(connectorCache)
      .values({
        connectorName,
        cacheKey,
        payload: data as any,
        fetchedAt: new Date(),
        expiresAt,
      })
      .onConflictDoUpdate({
        target: [connectorCache.connectorName, connectorCache.cacheKey],
        set: {
          payload: data as any,
          fetchedAt: new Date(),
          expiresAt,
        },
      });

    console.log(`[${connectorName}] Cached data for key: ${cacheKey}`);
  } catch (error) {
    console.error(`[${connectorName}] Cache write error:`, error);
  }
}

/**
 * Fetch with timeout
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

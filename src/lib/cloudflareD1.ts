const CF_ACCOUNT_ID =
  process.env.CLOUDFLARE_ACCOUNT_ID || '2e1b9f31899de83cd61c91278688516c';
const CF_D1_DATABASE_ID =
  process.env.CLOUDFLARE_D1_DATABASE_ID || 'ef9f1b15-1d70-4213-9be3-2069f2f406d2';

/**
 * Execute a parameterized SQL query against Cloudflare D1 via the official Cloudflare REST API.
 * Safe to call from both local dev and serverless environments whenever CLOUDFLARE_API_TOKEN is set.
 */
export async function executeD1Query<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | null)[] = []
): Promise<{ success: boolean; results?: T[]; error?: string }> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) {
    return { success: false, error: 'CLOUDFLARE_API_TOKEN is not configured' };
  }

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_D1_DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, params }),
        cache: 'no-store',
      }
    );

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data?.errors?.[0]?.message || `D1 HTTP ${res.status}`,
      };
    }

    const firstResult = Array.isArray(data.result) ? data.result[0] : data.result;
    return {
      success: true,
      results: (firstResult?.results as T[]) || [],
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown D1 error',
    };
  }
}

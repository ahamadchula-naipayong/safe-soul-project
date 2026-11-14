export const onRequestGet = async (context: {
  request: Request;
  env: { ASSETS: any };
  params: { id: string };
}) => {
  const { request, env } = context;
  // First try serving pre-rendered static asset if it exists
  const directRes = await env.ASSETS.fetch(request);
  if (directRes.status === 200) {
    return directRes;
  }

  // Otherwise serve the dynamic News Reader shell (/news/_dynamic) which fetches full article data from /api/news/:id
  const shellUrl = new URL('/news/_dynamic', request.url);
  const shellRes = await env.ASSETS.fetch(shellUrl);
  return new Response(shellRes.body, {
    status: 200,
    headers: shellRes.headers,
  });
};

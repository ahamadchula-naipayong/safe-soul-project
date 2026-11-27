/**
 * 24/7 Cloudflare Worker Cron Trigger for Fitrah Shield Discord Content Sync.
 *
 * Fires on exact schedules (05:05, 12:05, 20:05 ICT) and triggers GitHub Actions
 * workflow_dispatch so the sync runs reliably even when the user's PC is powered off.
 */

async function triggerGitHubWorkflow(env, reason) {
  if (!env.GITHUB_DISPATCH_TOKEN) {
    throw new Error('Missing GITHUB_DISPATCH_TOKEN secret in Worker environment');
  }

  const owner = env.GITHUB_OWNER || 'ahamadchula-naipayong';
  const repo = env.GITHUB_REPO || 'safe-soul-project';
  const workflowFile = env.GITHUB_WORKFLOW_FILE || 'discord-schedule-sync.yml';
  const ref = env.GITHUB_REF || 'main';
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/dispatches`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GITHUB_DISPATCH_TOKEN.trim()}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'fitrah-discord-cron-worker',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ref,
      inputs: {
        update_existing: 'false',
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GitHub dispatch failed (${res.status}): ${errText}`);
  }

  return {
    ok: true,
    status: res.status,
    triggeredAt: new Date().toISOString(),
    reason,
    workflow: workflowFile,
    ref,
  };
}

export default {
  async scheduled(event, env, ctx) {
    const runPromise = triggerGitHubWorkflow(env, `cron:${event.cron}`)
      .then((result) => {
        console.log('Triggered GitHub workflow successfully:', JSON.stringify(result));
        return result;
      })
      .catch((err) => {
        console.error('Failed to trigger GitHub workflow:', err?.message || err);
        throw err;
      });
    ctx.waitUntil(runPromise);
  },

  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
      return Response.json({
        ok: true,
        worker: 'fitrah-discord-cron',
        schedulesICT: ['05:05', '12:05', '20:05'],
        workflow: env.GITHUB_WORKFLOW_FILE || 'discord-schedule-sync.yml',
      });
    }

    if (request.method === 'POST' && url.pathname === '/trigger') {
      const expected = env.CRON_TRIGGER_SECRET;
      const authHeader = request.headers.get('Authorization') || '';
      if (!expected || authHeader !== `Bearer ${expected}`) {
        return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
      }

      try {
        const result = await triggerGitHubWorkflow(env, 'manual-http');
        return Response.json(result, { status: 200 });
      } catch (err) {
        return Response.json(
          { ok: false, error: err?.message || 'Dispatch failed' },
          { status: 500 }
        );
      }
    }

    return Response.json({ ok: false, error: 'Not Found' }, { status: 404 });
  },
};

/* Baby List sync endpoint — Cloudflare Worker + KV.
   Free, no auto-deletion, and the shared list is only reachable with the token.

   Setup (dashboard, about five minutes):
     1. Workers & Pages -> Create -> Worker -> paste this file -> Deploy
     2. Storage & Databases -> KV -> Create namespace "baby-list"
     3. Worker -> Settings -> Bindings -> add KV namespace, variable name LIST
     4. Worker -> Settings -> Variables -> add a SECRET named TOKEN
        Generate one with:  openssl rand -hex 24
     5. In the app: Settings -> endpoint = https://<worker>.workers.dev
                              key      = the TOKEN value
   The same two values go in the CLOUD_URL and CLOUD_KEY repository secrets
   so the reminder workflow can read and write the list too. */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Max-Age': '86400'
};
const json = (body, status = 200) =>
  new Response(body, { status, headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    if (!env.TOKEN || token !== env.TOKEN) return json('{"error":"unauthorized"}', 401);

    if (req.method === 'GET') {
      const doc = await env.LIST.get('doc');
      return json(doc || 'null');
    }

    if (req.method === 'PUT') {
      const body = await req.text();
      if (body.length > 512 * 1024) return json('{"error":"too large"}', 413);
      try { JSON.parse(body); } catch (e) { return json('{"error":"invalid json"}', 400); }
      await env.LIST.put('doc', body);
      return json('{"ok":true}');
    }

    return json('{"error":"method not allowed"}', 405);
  }
};

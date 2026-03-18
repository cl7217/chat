const fetch = globalThis.fetch || require('node-fetch')

exports.handler = async function(event, context) {
  const BACKEND = process.env.BACKEND_URL || process.env.VITE_API_URL
  if (!BACKEND) return { statusCode: 500, body: JSON.stringify({error:'BACKEND_URL not set'}) }

  const path = event.path.replace(/^\/api\/proxy\/?/, '')
  const url = BACKEND.replace(/\/$/, '') + '/' + path

  const headers = {};
  for (const [k,v] of Object.entries(event.headers || {})) headers[k] = v
  delete headers['host']

  try {
    const opts = { method: event.httpMethod, headers }
    if (event.body && !['GET','HEAD'].includes(event.httpMethod)) {
      opts.body = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body
      if (!opts.headers['content-type']) opts.headers['content-type'] = 'application/json'
    }
    const r = await fetch(url, opts)
    const text = await r.text()
    const responseHeaders = {}
    r.headers.forEach((v,k)=> responseHeaders[k]=v)
    return { statusCode: r.status, body: text, headers: responseHeaders }
  } catch (err) {
    console.error('proxy error', err)
    return { statusCode: 502, body: JSON.stringify({error:'bad gateway'}) }
  }
}

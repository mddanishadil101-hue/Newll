let shouldBypass = false;
const refDomain = normalizeDomain(ref);
const refFull = normalizeFull(ref);

const postRef = req.query.post_ref || null;

if (urlData.specific_referrer && String(urlData.specific_referrer).trim()!=='') {
  const required = normalizeFull(urlData.specific_referrer);
  if (ref === 'direct' || refFull !== required) shouldBypass = true;
} else if (urlData.partner_domain) {
  const requiredDomain = normalizeDomain(urlData.partner_domain);
  if (ref === 'direct') shouldBypass = true;
  else {
    if (!refDomain) shouldBypass = true;
    else if (!(refDomain === requiredDomain || refDomain.endsWith('.' + requiredDomain))) shouldBypass = true;
  }
} else {
  shouldBypass = false;
}

if (shouldBypass) {
  try {
    await pool.query(
      'INSERT INTO bypass_logs (code, referrer, ip_address, user_agent) VALUES ($1, $2, $3, $4)',
      [code, postRef, ip || null, ua || null]
    );
  } catch(e) {
    console.error('log bypass', e);
  }

  return res.status(403).send(`
    <!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Access Denied</title>
    <style>body{font-family:system-ui;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
    .c{background:rgba(0,0,0,0.4);padding:24px;border-radius:12px;text-align:center;max-width:520px}
    h1{margin:0 0 8px} p{margin:8px 0}</style></head><body><div class="c"><h1>⚠️ Warning: bypass detected</h1><p>please don't bypass the link. Shortlinks help keep this service free.</p><p style="opacity:0.9;margin-top:12px">developed by <strong>@RSCBots</strong></p></div></body></html>`);
}

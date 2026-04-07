export function baseTemplate(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 40px; text-align: center; }
    .logo { color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .logo span { opacity: 0.7; font-weight: 400; }
    .body { padding: 40px; }
    .title { font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .subtitle { font-size: 15px; color: #64748b; line-height: 1.6; margin-bottom: 24px; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin: 24px 0; }
    .info-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-size: 13px; color: #64748b; }
    .info-value { font-size: 14px; font-weight: 600; color: #0f172a; }
    .ticket-grid { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
    .ticket { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 6px 12px; font-family: monospace; font-size: 13px; font-weight: 700; color: #4338ca; }
    .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; margin: 24px 0; }
    .win-box { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 1px solid #86efac; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
    .win-emoji { font-size: 40px; margin-bottom: 12px; }
    .win-prize { font-size: 28px; font-weight: 800; color: #15803d; margin-bottom: 4px; }
    .win-ticket { font-family: monospace; font-size: 16px; font-weight: 700; color: #166534; }
    .footer { background: #f1f5f9; border-top: 1px solid #e2e8f0; padding: 24px 40px; text-align: center; }
    .footer p { font-size: 12px; color: #94a3b8; line-height: 1.6; }
    .footer a { color: #6366f1; text-decoration: none; }
    @media (max-width: 600px) {
      .body { padding: 24px 20px; }
      .header { padding: 24px 20px; }
      .footer { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo">Winu<span>Wallet</span></div>
      </div>
      <div class="body">
        ${bodyHtml}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} WinuWallet — The fair crypto prize platform.</p>
        <p style="margin-top:6px"><a href="#">Unsubscribe</a> · <a href="#">Privacy Policy</a></p>
      </div>
    </div>
  </div>
</body>
</html>`
}

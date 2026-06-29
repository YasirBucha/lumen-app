import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Serve assets (og-card, images)
app.use('/assets/*', serveStatic({ root: './' }))
// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Serve main app
app.get('/', (c) => {
  return c.html(HTML)
})

const HTML = `<!DOCTYPE html>
<html lang="en" data-screen-label="Lumen — Subscription Intelligence">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Lumen — Subscription Intelligence</title>
  <meta name="description" content="See every subscription. Spend with intent. A Gmail-connected subscription ledger with verified amounts, AI verdicts, and editorial design. Prototype Vol. III by Yasir Bucha." />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Lumen — Subscription Intelligence" />
  <meta property="og:description" content="See every subscription. Spend with intent. A Gmail-connected ledger with verified amounts, AI verdicts, and editorial design." />
  <meta property="og:image" content="/assets/og-card.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Lumen · Vol. III · Prototype" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Lumen — Subscription Intelligence" />
  <meta name="twitter:description" content="See every subscription. Spend with intent." />
  <meta name="twitter:image" content="/assets/og-card.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,400;1,9..144,500;1,9..144,600;1,9..144,700&family=Inter+Tight:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Geist:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    html, body { margin: 0; padding: 0; height: 100%; overflow: hidden;
      background: #06090A; -webkit-font-smoothing: antialiased; font-feature-settings: 'ss01', 'ss02', 'tnum';
      font-family: 'Inter Tight', system-ui, sans-serif; }
    button { font-family: inherit; }
    *::-webkit-scrollbar { width: 6px; height: 6px; }
    *::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 9999px; }
    *::-webkit-scrollbar-track { background: transparent; }
  </style>
  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin="anonymous"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" src="/static/tokens.jsx"></script>
  <script type="text/babel" src="/static/data.jsx"></script>
  <script type="text/babel" src="/static/primitives.jsx"></script>
  <script type="text/babel" src="/static/ios_frame.jsx"></script>
  <script type="text/babel" src="/static/tweaks_panel.jsx"></script>
  <script type="text/babel" src="/static/sub-detail-extras.jsx"></script>
  <script type="text/babel" src="/static/alerts-inbox.jsx"></script>
  <script type="text/babel" src="/static/renewal-calendar.jsx"></script>
  <script type="text/babel" src="/static/command-palette.jsx"></script>
  <script type="text/babel" src="/static/onboarding-tour.jsx"></script>
  <script type="text/babel" src="/static/screens-mobile.jsx"></script>
  <script type="text/babel" src="/static/screens-mobile-main.jsx"></script>
  <script type="text/babel" src="/static/screens-mobile-aux.jsx"></script>
  <script type="text/babel" src="/static/screen-desktop-aux.jsx"></script>
  <script type="text/babel" src="/static/screen-desktop.jsx"></script>
  <script type="text/babel" src="/static/connect-gmail-flow.jsx"></script>
  <script type="text/babel" src="/static/dashboard-cards.jsx"></script>
  <script type="text/babel" src="/static/app.jsx"></script>
</body>
</html>`

export default app

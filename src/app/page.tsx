// This page is never reached in practice — the proxy (src/proxy.ts) redirects
// all root requests to /[locale] via next-intl routing.
export default function RootPage() {
  return null
}

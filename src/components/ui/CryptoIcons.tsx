interface CryptoIconProps {
  className?: string
}

/** Bitcoin ₿ — circle with stylised B */
export function BTCIcon({ className }: CryptoIconProps) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Outer ring */}
      <circle cx="100" cy="100" r="92" fill="currentColor" opacity="0.10" />
      <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="2.5" opacity="0.18" fill="none" />
      {/* Inner ring */}
      <circle cx="100" cy="100" r="72" stroke="currentColor" strokeWidth="1.5" opacity="0.10" fill="none" />
      {/* ₿ body — thick vertical stem */}
      <rect x="82" y="50" width="14" height="100" rx="4" fill="currentColor" opacity="0.85" />
      {/* Top serif bars */}
      <rect x="75" y="44" width="8" height="14" rx="2" fill="currentColor" opacity="0.85" />
      <rect x="75" y="142" width="8" height="14" rx="2" fill="currentColor" opacity="0.85" />
      {/* Upper bump */}
      <path d="M96 56 C96 56 128 56 128 70 C128 84 96 84 96 84 Z" fill="currentColor" opacity="0.85" />
      <path d="M96 84 C96 84 132 84 132 98 C132 112 96 112 96 112 Z" fill="currentColor" opacity="0.85" />
      {/* Rounded tops of bumps */}
      <path d="M96 56 L96 84 C96 84 128 84 128 70 C128 56 96 56 96 56 Z" fill="currentColor" opacity="0.85" />
      <path d="M96 84 L96 112 C96 112 132 112 132 98 C132 84 96 84 96 84 Z" fill="currentColor" opacity="0.85" />
    </svg>
  )
}

/** Ethereum — classic diamond / tetrahedron shape */
export function ETHIcon({ className }: CryptoIconProps) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Top pyramid — solid */}
      <polygon points="100,20 155,95 100,118 45,95" fill="currentColor" opacity="0.80" />
      {/* Bottom pyramid */}
      <polygon points="100,180 155,110 100,130 45,110" fill="currentColor" opacity="0.55" />
      {/* Left face shading */}
      <polygon points="100,20 45,95 100,118" fill="currentColor" opacity="0.15" />
      {/* Right face shading */}
      <polygon points="100,20 155,95 100,118" fill="currentColor" opacity="0.00" />
      {/* Bottom left shading */}
      <polygon points="100,180 45,110 100,130" fill="currentColor" opacity="0.20" />
      {/* Horizontal divider line */}
      <line x1="45" y1="104" x2="155" y2="104" stroke="currentColor" strokeWidth="1.5" opacity="0.20" />
    </svg>
  )
}

/** Solana — three horizontal gradient bars */
export function SOLIcon({ className }: CryptoIconProps) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Bar 1 (top) */}
      <path
        d="M30 62 L152 62 C157 62 160 65 157 68 L143 80 C141 82 137 84 133 84 L12 84 C7 84 4 81 7 78 L21 66 C23 64 27 62 30 62 Z"
        fill="currentColor" opacity="0.85"
      />
      {/* Bar 2 (middle) */}
      <path
        d="M30 89 L152 89 C157 89 160 92 157 95 L143 107 C141 109 137 111 133 111 L12 111 C7 111 4 108 7 105 L21 93 C23 91 27 89 30 89 Z"
        fill="currentColor" opacity="0.70"
      />
      {/* Bar 3 (bottom) */}
      <path
        d="M30 116 L152 116 C157 116 160 119 157 122 L143 134 C141 136 137 138 133 138 L12 138 C7 138 4 135 7 132 L21 120 C23 118 27 116 30 116 Z"
        fill="currentColor" opacity="0.85"
      />
    </svg>
  )
}

/** Tether / USDT — circle with T bar */
export function USDTIcon({ className }: CryptoIconProps) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Outer circle */}
      <circle cx="100" cy="100" r="90" fill="currentColor" opacity="0.10" />
      <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="2.5" opacity="0.20" fill="none" />
      {/* T horizontal bar */}
      <rect x="42" y="52" width="116" height="18" rx="5" fill="currentColor" opacity="0.85" />
      {/* T vertical stem */}
      <rect x="88" y="52" width="24" height="100" rx="5" fill="currentColor" opacity="0.85" />
      {/* Horizontal rule */}
      <rect x="55" y="110" width="90" height="10" rx="5" fill="currentColor" opacity="0.45" />
    </svg>
  )
}

/** BNB — nested diamonds */
export function BNBIcon({ className }: CryptoIconProps) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Outer diamond */}
      <polygon points="100,18 182,100 100,182 18,100" fill="currentColor" opacity="0.12" />
      <polygon points="100,18 182,100 100,182 18,100" stroke="currentColor" strokeWidth="2.5" opacity="0.22" fill="none" />
      {/* BNB cross pattern — 4 small diamonds at corners */}
      <polygon points="100,36 116,52 100,68 84,52" fill="currentColor" opacity="0.80" />
      <polygon points="164,100 180,116 164,132 148,116" fill="currentColor" opacity="0.80" />
      <polygon points="100,132 116,148 100,164 84,148" fill="currentColor" opacity="0.80" />
      <polygon points="36,100 52,116 36,132 20,116" fill="currentColor" opacity="0.80" />
      {/* Centre diamond */}
      <polygon points="100,68 132,100 100,132 68,100" fill="currentColor" opacity="0.70" />
    </svg>
  )
}

/** Default — concentric circles */
export function DefaultCryptoIcon({ className }: CryptoIconProps) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="100" cy="100" r="88" fill="currentColor" opacity="0.10" />
      <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="2.5" opacity="0.18" fill="none" />
      <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="2" opacity="0.18" fill="none" />
      <circle cx="100" cy="100" r="32" fill="currentColor" opacity="0.20" />
    </svg>
  )
}

/** Public CoinGecko image URLs for real coin logos */
export const CRYPTO_IMAGE_URLS: Record<string, string> = {
  BTC: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  USDT: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
  USDC: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
  BNB: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
}

export function getCryptoImageUrl(crypto: string): string | null {
  return CRYPTO_IMAGE_URLS[crypto] ?? null
}

const ICON_MAP: Record<string, (props: CryptoIconProps) => React.JSX.Element> = {
  BTC: BTCIcon,
  ETH: ETHIcon,
  SOL: SOLIcon,
  USDT: USDTIcon,
  USDC: USDTIcon,
  BNB: BNBIcon,
}

export function CryptoIcon({ crypto, className }: { crypto: string; className?: string }) {
  const Icon = ICON_MAP[crypto] ?? DefaultCryptoIcon
  return <Icon className={className} />
}

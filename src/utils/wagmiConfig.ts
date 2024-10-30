import { http, createConfig } from "@wagmi/core"
import { mainnet, avalanche, arbitrum, base, polygon } from "@wagmi/core/chains"

export const config = createConfig({
  chains: [mainnet, avalanche, arbitrum, base, polygon],
  transports: {
    [mainnet.id]: http(),
    [avalanche.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
  },
})

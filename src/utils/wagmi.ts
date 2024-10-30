import { http, createConfig } from "@wagmi/core"
import { mainnet, avalanche, arbitrum, base, polygon } from "@wagmi/core/chains"
import { IChain } from "../types"
import { getBalance } from "@wagmi/core"
import { Address } from "viem"

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

export const getTokenBalanceOnAllChains = async (
  chains: IChain[],
  userAddress: Address
) => {
  const balance = chains.map((ele: IChain) =>
    getBalance(config, {
      address: userAddress,
      token: ele.tokenAddress,
      chainId: ele.chainId,
    })
  )

  const balances = await Promise.all(balance)
  return balances.map((ele, index) => ({
    ...ele,
    chainId: chains[index].chainId,
  }))
}

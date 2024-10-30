import { Elysia, t } from "elysia"
import { getBalance } from "@wagmi/core"
import { config, getTokenBalanceOnAllChains } from "./utils/wagmi"
import { UsdcAddresses } from "./constants/usdcAddresses"
import {
  fetchBridgingFeesFromMultipleChains,
  fetchBridgingFess,
} from "./services/bridgingFeeService"
import { IChain } from "./types"
import { isAddress } from "viem"

const app = new Elysia()
  .get(
    "/source-funds",
    async ({ query, error }) => {
      const { targetChainId, amount, userAddress } = query
      // validate if string is address
      if (!isAddress(userAddress)) {
        return error(400, {
          success: false,
          error: "userAddress is not a valid address",
        })
      }
      // validate if we support chain
      if (!UsdcAddresses.find((chain) => chain.chainId === targetChainId)) {
        return error(400, {
          success: false,
          error: "targetChainId is not supported",
        })
      }

      console.time()
      const balances = await getTokenBalanceOnAllChains(
        UsdcAddresses,
        userAddress
      )

      const chainsWithTokenBalance = balances.filter(
        (chain) => chain.formatted !== "0"
      )

      const balanceInTargetChainId = chainsWithTokenBalance.find(
        (chain) => chain.chainId === targetChainId
      )
      // return if target chain has sufficient funds
      if (Number(balanceInTargetChainId?.formatted) > amount) {
        return {
          success: true,
          routes: [],
          message:
            "You have sufficient funds on the target chain, no need to source funds.",
        }
      }

      const chainIdsWithTokenBalance = chainsWithTokenBalance.map(
        (chain) => chain.chainId
      )
      // fetch bridging estimation only for chains that have balance
      const usdcChainAddressWithTokenBalance = chainIdsWithTokenBalance
        .map((chainId) => UsdcAddresses.find((ele) => ele.chainId === chainId))
        .filter((ele): ele is IChain => ele !== undefined)

      const fees = await fetchBridgingFeesFromMultipleChains(
        usdcChainAddressWithTokenBalance
          ?.map((ele) => ele.chainId)
          .filter((ele) => ele !== targetChainId),
        targetChainId,
        amount,
        userAddress
      )

      console.timeEnd()

      return fees
    },
    {
      query: t.Object({
        targetChainId: t.Number(),
        amount: t.Number(),
        userAddress: t.String(),
      }),
    }
  )
  .listen(3001)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)

// Get the contracts for USDC on all the chains
// Extract balance of USDC for userAddress on all chains
// Check if user has enough usdc in target chain
// If not get the gas fee for bridging from all chains to target chain
// Calculate the most efficient route for bridging
// Bonus: Check the time for bridging from each chain
// Create a toggle for u want it fast or low fee and optimize route on basis of that

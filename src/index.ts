import { Elysia, t } from "elysia"
import { getTokenBalanceOnAllChains } from "./utils/wagmi"
import { UsdcAddresses } from "./constants/usdcAddresses"
import { fetchBridgingDetailsFromMultipleChains } from "./services/bridgingFeeService"
import { IChain } from "./types"
import { isAddress } from "viem"
import {
  calculateFundSourceFromRoutes,
  transformSourcedFundDetails,
} from "./utils/bridgeUtils"

const app = new Elysia()
  .get(
    "/source-funds",
    async ({ query, error }) => {
      const { targetChainId, amount, userAddress, prioritizeTime } = query
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
      const balancesPromise = getTokenBalanceOnAllChains(
        UsdcAddresses,
        userAddress
      )

      const routeDetailsPromise = fetchBridgingDetailsFromMultipleChains(
        UsdcAddresses?.map((ele) => ele.chainId).filter(
          (ele) => ele !== targetChainId
        ),
        targetChainId,
        amount,
        userAddress
      )

      const [balances, routeDetails] = await Promise.all([
        balancesPromise,
        routeDetailsPromise,
      ])

      const chainsWithTokenBalance = balances.filter(
        (chain) => chain.formatted !== "0"
      )

      const balanceInTargetChainId = chainsWithTokenBalance.find(
        (chain) => chain.chainId === targetChainId
      ) || { formatted: "0" }

      // return if target chain has sufficient funds
      if (Number(balanceInTargetChainId?.formatted) > amount) {
        return {
          success: true,
          message:
            "You have sufficient funds on the target chain, no need to source funds.",
        }
      }

      const totalBalanceInAllChains = balances.reduce((acc, curr) => {
        return Number(curr?.formatted) + acc
      }, 0)

      // return if user has unsufficient balance to source from
      if (totalBalanceInAllChains < amount) {
        return error(400, {
          success: false,
          error: "Not enough funds on different chains to source",
        })
      }

      const routeDetailsWithAmount = routeDetails.map((route) => {
        return {
          ...route,
          availableBalance: Number(
            chainsWithTokenBalance?.find(
              (chain) => chain.chainId === route.sourceChainId
            )?.formatted
          ),
        }
      })

      const sourcingFundDetails = calculateFundSourceFromRoutes(
        routeDetailsWithAmount,
        amount - Number(balanceInTargetChainId?.formatted),
        prioritizeTime
      )

      const res = transformSourcedFundDetails(
        sourcingFundDetails,
        targetChainId
      )
      console.timeEnd()

      return {
        success: true,
        response: res,
      }
    },
    {
      query: t.Object({
        targetChainId: t.Number(),
        amount: t.Number(),
        userAddress: t.String(),
        prioritizeTime: t.Boolean({ default: false }),
      }),
    }
  )
  .listen(3001)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)

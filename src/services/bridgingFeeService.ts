import axios from "axios"
import { UsdcAddresses } from "../constants/usdcAddresses"
import {
  getRouteWithLeastGas,
  getRouteWithLeastTime,
} from "../utils/bridgeUtils"

export const fetchBridgingFess = async (
  sourceChainId: number,
  targetChainId: number,
  amount: number,
  userAddress: string
) => {
  const fromTokenAddress = UsdcAddresses.find(
    (ele) => ele.chainId === sourceChainId
  )?.tokenAddress
  const toTokenAddress = UsdcAddresses.find(
    (ele) => ele.chainId === targetChainId
  )?.tokenAddress

  if (!fromTokenAddress || !toTokenAddress) {
    throw new Error("USDC is not supported on this chain")
  }

  try {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://api.socket.tech/v2/quote?fromChainId=${sourceChainId}&fromTokenAddress=${fromTokenAddress}&toChainId=${targetChainId}&toTokenAddress=${toTokenAddress}&fromAmount=${
        amount * 1e6
      }&userAddress=${userAddress}&recipient=${userAddress}&uniqueRoutesPerBridge=true&singleTxOnly=true&sort=gas`,
      headers: {
        Accept: "application/json",
        "API-KEY": "72a5b4b0-e727-48be-8aa1-5da9d62fe635",
      },
    }

    const response = await axios(config)
    if (response.data.success && response?.data?.result?.routes?.length) {
      const routes = response?.data?.result?.routes
      const routeWithLeastGas = getRouteWithLeastGas(routes)
      const routeWithLeastTime = getRouteWithLeastTime(routes)
      const res = {
        sourceChainId,
        leastGasRoute: {
          gasFee: routeWithLeastGas.totalGasFeesInUsd,
          timeTaken: routeWithLeastGas.serviceTime,
          bridgeUsed: routeWithLeastGas.usedBridgeNames[0],
        },
        leastTimeRoute: {
          gasFee: routeWithLeastTime.totalGasFeesInUsd,
          timeTaken: routeWithLeastTime.serviceTime,
          bridgeUsed: routeWithLeastTime.usedBridgeNames[0],
        },
      }
      return res
    }
    throw new Error("Not able to fetch bridging Quotes as no routes found")
  } catch (err) {
    throw new Error("Not able to fetch bridging Quotes")
  }
}

export const fetchBridgingDetailsFromMultipleChains = async (
  sourceChainIds: number[],
  targetChainId: number,
  amount: number,
  userAddress: string
) => {
  const bridgingFeesPromise = sourceChainIds.map((chainId) =>
    fetchBridgingFess(chainId, targetChainId, amount, userAddress)
  )

  const bridgingFees = await Promise.all(bridgingFeesPromise)
  return bridgingFees
}

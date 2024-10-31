import { Address } from "viem"

export interface IChain {
  name: string
  chainId: 42161 | 43114 | 8453 | 1 | 137
  tokenAddress: `0x${string}`
}

export interface IBungeeRoute {
  routeId: string
  isOnlySwapRoute: false
  fromAmount: number
  toAmount: number
  usedBridgeNames: string[]
  totalUserTx: number
  sender: Address
  recipient: Address
  totalGasFeesInUsd: number
  receivedValueInUsd: number
  inputValueInUsd: number
  outputValueInUsd: number
  serviceTime: number
  maxServiceTime: number
}

export interface IRouteDetail {
  sourceChainId: number
  leastGasRoute: {
    gasFee: number
    timeTaken: number
    bridgeUsed: string
  }
  leastTimeRoute: {
    gasFee: number
    timeTaken: number
    bridgeUsed: string
  }
}

export interface IRouteDetailWithAmount extends IRouteDetail {
  availableBalance: number
}

export interface ISourceFundDetails {
  sourceChainId: number
  bridgeUsed: string
  gasFee: number
  timeTaken: number
  amount: number
}

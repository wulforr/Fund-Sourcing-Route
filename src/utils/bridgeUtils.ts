import {
  IBungeeRoute,
  IRouteDetailWithAmount,
  ISourceFundDetails,
} from "../types"

export const getRouteWithLeastTime = (routes: IBungeeRoute[]) => {
  const sortedRoutes = routes.sort((a, b) => a.serviceTime - b.serviceTime)
  return sortedRoutes[0]
}

export const getRouteWithLeastGas = (routes: IBungeeRoute[]) => {
  const sortedRoutes = routes.sort(
    (a, b) => a.totalGasFeesInUsd - b.totalGasFeesInUsd
  )
  return sortedRoutes[0]
}

export const calculateFundSourceFromRoutes = (
  routeDetails: IRouteDetailWithAmount[],
  totalFundsToSource: number,
  prioritizeTime: boolean
) => {
  const routeDetailsSorted = routeDetails.sort((a, b) => {
    if (prioritizeTime) {
      return a.leastTimeRoute.timeTaken - b.leastTimeRoute.timeTaken
    }
    return a.leastGasRoute.gasFee - b.leastGasRoute.gasFee
  })

  const sourcedFundDetails = []
  let totalFundsNeeded = totalFundsToSource

  for (let i = 0; i < routeDetailsSorted?.length; i++) {
    if (totalFundsNeeded <= 0) break

    const fundRoute = prioritizeTime
      ? routeDetailsSorted[i].leastTimeRoute
      : routeDetailsSorted[i].leastGasRoute

    sourcedFundDetails.push({
      sourceChainId: routeDetailsSorted[i].sourceChainId,
      bridgeUsed: fundRoute.bridgeUsed,
      gasFee: fundRoute.gasFee,
      timeTaken: fundRoute.timeTaken,
      amount: Math.min(
        routeDetailsSorted[i].availableBalance,
        totalFundsNeeded
      ),
    })

    totalFundsNeeded = totalFundsNeeded - routeDetailsSorted[i].availableBalance
  }

  return sourcedFundDetails
}

export const transformSourcedFundDetails = (
  sourcedFundDetails: ISourceFundDetails[],
  targetChainId: number
) => {
  const routeUsed = []
  let totalGasUsed = 0
  let totalTimeTaken = 0
  for (const fundDetail of sourcedFundDetails) {
    routeUsed.push({
      sourceChainId: fundDetail.sourceChainId,
      targetChainId,
      amount: fundDetail.amount,
    })
    totalGasUsed += fundDetail.gasFee
    totalTimeTaken += fundDetail.timeTaken
  }

  return {
    routeUsed,
    totalGasUsed,
    totalTimeTaken,
  }
}

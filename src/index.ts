import { Elysia } from "elysia"
import { getBalance } from "@wagmi/core"
import { config } from "./utils/wagmiConfig"
import { UsdcAddresses } from "./constants/usdcAddresses"

const balance = UsdcAddresses.map((ele) =>
  getBalance(config, {
    address: "0x469eA996dd8d4c779B4D7DB884B7841EcAaE5922",
    token: ele.tokenAddress,
    chainId: ele.chainId,
  })
)

const balances = await Promise.all(balance)

const app = new Elysia().get("/", () => "Hello Elysia").listen(3001)

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

# Mercle Tech Assessment

An API that returns the most efficient fund sourcing route

## Getting Started

Install the necessary dependencies

```bash
npm i
```

## Development

To start the development server run:

```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.

## API to fetch the most cost-efficient bridge path for sourcing funds.

```http
  GET /source-funds
```

### Parameters

| Name           | Type    | Description                                         |
| -------------- | ------- | --------------------------------------------------- |
| targetChainId  | number  | Chain Id of the chain on which user wants the funds |
| amount         | number  | Amount of funds needed                              |
| userAddress    | string  | Address of the user                                 |
| prioritizeTime | boolean | Toggle to prioritize time instead of gas fee        |

### Response

```js
{
  "success": true,
  "response": {
    "routeUsed": [
      {
        "sourceChainId": 42161,
        "targetChainId": 43114,
        "amount": 758989
      }
    ],
    "totalGasUsed": 0.024892600000000004,
    "totalTimeTaken": 60
  }
}
```

## Critical Decisions and Assumptions

> 1. The Api from bungee to fetch balances is not used instead used the balance fetching method from wagmi which uses viem internally. This was done based on data that I collected by comparing both the methods and found that fetching using wagmi natively was fast always.

> 2. The Api to bungee is called for all the supported chains in parallel with the call to fetch balance of tokens in users wallet. This is done to speed up the process. We can wait for token balances to fetch and make the api calls for only the chains which have some balance but this would lead to increase in api response time and as time is our first priority so this decision was taken.

> 3. No caching is used as both the balances of user and the gas fee for bridging is completely dynamic hence by caching the correctness of data could not be assured. One thing that we can do is maybe cache the gas fee for 10 seconds as this is being used by many other platforms as well.(Checked for metamask - it refreshes estimated gas fee for transactions every 10 seconds).

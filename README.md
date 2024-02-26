# Pendle BedRock Balance Tracking 

Pendle system wraps `uniETH (Wrapped Bedrock UniETH)` into an ERC5115 token `SY`.

`SY` can then be used in Pendle's system to:
- Tokenize into `PT` and `YT`, where `YT` holders are entitled to all interests and rewards.
- Supply into Pendle's AMM to receive `LP` token.

`LP` token can then be deposited into Liquid Lockers platform (Penpie, Equilibira, StakeDAO) to enhance their yield.

## Methodology

We built a [subgraph](https://thegraph.com/hosted-service/subgraph/pendle-finance/unieth-balance-tracker) tracking `Transfer` events from all above-mentioned tokens and update addresses' balance accordingly.

- Add up shares for users with `SY` balance (excluding `YT` and `LP` addresses).
- Calculate according shares for `YT` address, add up shares proportionally for users holding `YT`.
- Calculate according shares for `LP` address, add up shares proportionally for users (excluding liquid lockers addresses).
- For each liquid locker, we calculate their according share and distribute proportionally to their receipt token holders. 

## Usage

The function of `fetchUserBalanceSnapshot(blockNumber)` in `./src/unieth-snapshot.js` returns a record mapping of `[address] => ethers.BigNumber`, representing the implied amount of `UniETH` each address is holding at the specified block.

## Double-Checking

A simple check can be applied to the result of the script, by checking whether the sum of returned values for all users would not exceed the amount of `UniETH` held in `SY` contract.
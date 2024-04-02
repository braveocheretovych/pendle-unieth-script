const {
  SUBGRAPH_ENDPOINT,
  USER_BALANCE_QUERY,
  USER_PENDING_INTEREST_QUERY,
  YT_INDEX_QUERY,
  PENDLE_TREASURY,
  LIQUID_LOCKERS,
  LP,
  LP2,
} = require("./consts");
const {
  applyLpHolderShares,
  applyYtHolderShares,
  applySyHoldersShares,
} = require("./logic");
const { fetchAll } = require("./subgraph");
const { BigNumber } = require("ethers");

async function fetchUserBalanceSnapshot(blockNumber) {
  const result = {};
  const [allBalances, allInterests, indexes] = await Promise.all([
    fetchAll(
      SUBGRAPH_ENDPOINT,
      USER_BALANCE_QUERY.query,
      USER_BALANCE_QUERY.collection,
      { block: blockNumber }
    ),
    fetchAll(
      SUBGRAPH_ENDPOINT,
      USER_PENDING_INTEREST_QUERY.query,
      USER_PENDING_INTEREST_QUERY.collection,
      { block: blockNumber }
    ),
    fetchAll(
      SUBGRAPH_ENDPOINT,
      YT_INDEX_QUERY.query,
      YT_INDEX_QUERY.collection,
      { block: blockNumber }
    ),
  ]);

  applySyHoldersShares(result, allBalances);
  applyYtHolderShares(
    result,
    allBalances,
    allInterests,
    BigNumber.from(indexes[0].index)
  );
  await applyLpHolderShares(
    result,
    allBalances,
    blockNumber,
    LP,
    LIQUID_LOCKERS
  );
  await applyLpHolderShares(result, allBalances, blockNumber, LP2, []);

  let sum = BigNumber.from(0);
  for (const user in result) {
    sum = sum.add(result[user]);
  }
  return result;
}

async function main() {
  const USER = "0x9193f32b0995815c4ff4a0111d85cfd83bb05247";
  for (let blk of [19565376]) {
    const res = await fetchUserBalanceSnapshot(blk);
    let sum = BigNumber.from(0);
    for (const user in res) {
      sum = sum.add(res[user]);
    }
    console.log(blk, res[USER].toString());
  }
}

main()
  .catch((err) => console.error(err))
  .then(() => process.exit(0));

const axios = require("axios");
const retry = require('../helper/retry');
const { chainExports } = require('../helper/exports');
const { sumTokens } = require("../helper/unwrapLPs");
const { getBlock } = require('../helper/getBlock');

const http_api_url = 'https://api.debridge.finance/api/Pairs/getForChain';
const debridgeGate = '0x43dE2d77BF8027e25dBD179B491e8d64f38398aA';
const chainIds = {
  ethereum: 1,
  bsc: 56,
  heco: 128,
  polygon: 137,
  arbitrum: 42161,
};

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    const block = await getBlock(timestamp, chain, chainBlocks);
    const transformAddress = id=>`${chain}:${id}`;

    const url = `${http_api_url}?chainId=${chainIds[chain]}`;
    const debridge_response = await retry(async () => await axios.get(url));
    // console.log(debridge_response)
    const tokensAndOwners = debridge_response.data
      .filter(t => !t.tokenName.startsWith('deBridge '))
      .map(t => [t.tokenAddress, debridgeGate]);

    await sumTokens(balances, tokensAndOwners, block, chain, transformAddress);
    console.log(`${chain} ${block} - ${tokens.length} tokens`);
    return balances
  };
}

module.exports = chainExports(chainTvl, [
  'ethereum', 
  'bsc', 
  'heco',
  'polygon', 
  'arbitrum', 
]),
module.exports.methodology = 'Debridge TVL is made of token balances of the DebridgeGate contracts. The deployed tokens are retrieved using Debridge HTTP REST API.'

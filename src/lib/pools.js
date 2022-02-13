

const getPairsQuery = {
    "operationName": "GetPairs",
    "variables": {
        "limit": 50
    },
    "query": "query GetPairs($limit: Int, $offset: Int) {\
    pairs(limit: $limit, offset: $offset) {\
    totalCount\
    edges {\
    node {\
    id\
    version\
    token1 {\
    id\
    standard\
    icon\
    tokenId\
    symbol\
    __typename\
    }\
    token2 {\
    id\
    standard\
    icon\
    tokenId\
    symbol\
    __typename\
    }\
    liquidity\
    volume24h\
    volume7d\
    volumeChange {\
    day\
    week\
    month\
    __typename\
    }\
    __typename\
    }\
    __typename\
    }\
    __typename\
    }\
    }"
};

const poolFee = 0.3; // percent
const TEZ_SUBUNIT = 1000000; // microtez
const TZNODE = "https://mainnet-tezos.giganode.io";

const getPoolsData = (data, cbEnd) => {
    fetch("https://granada-api.quipuswap.com/", data)
    .then(res => res.json())
    .then(cbEnd);
};

const getFarmingData = (cbEnd) => {
    fetch("https://stats.info.tzwrap.com/v1/liquidity-mining/apy")
    .then(res => res.json())
    .then(cbEnd);
};

var XTZPrice = 0;
var TokensInfo = null;

// Get token price
const getTokensData = (cb) => {
    var url = "https://api.teztools.io/token/prices";
    fetch(url)
    .then(res => res.json())
    .then(res => {
        XTZPrice = res.xtzusdValue;
        TokensInfo = res.contracts;
        cb();
    });
};

const getTokenPriceFromName = (tokenName) => {
    return TokensInfo.find(tdata => tdata.symbol == tokenName).usdValue;
};

const getTokenPriceFromContract = (tokenContract) => {
    TokensInfo.forEach((tdata) => {
        if (tdata.tokenAddress == tokenContract) {
            return tdata.usdValue;
        }
    });
};

// Get contract storage data on Tezos blockchain
const getContractStorage = (contractAddr, cbEnd) => {
    var url = TZNODE + "/chains/main/blocks/head/context/contracts/" + contractAddr + "/storage";
    fetch(url)
    .then(res => res.json())
    .then(cbEnd);
};

const computeQPPlentyFarms = (QPdexContract, cb) => {
    getTokensData(() => {
        getContractStorage(QPdexContract, (resp) => {
            const tez_pool = parseInt(resp.args[1].args[0].args[1].args[2].int);
            const total_Supply = parseInt(resp.args[1].args[0].args[4].int);
            const lpPriceInXtz = (tez_pool * 2) / total_Supply;
            const lpPrice = lpPriceInXtz * XTZPrice;
            // PLENTY/XTZ Plenty Farm contract
            getContractStorage("KT1JQAZqShNMakSNXc2cgTzdAWZFemGcU6n1", (resp) => {
                let totalSupply = resp.args[3].int;
                totalSupply = (totalSupply / Math.pow(10, 18)).toFixed(2);
                totalSupply = parseFloat(totalSupply);
                let rewardRate = resp.args[1].args[1].int;
                rewardRate = (rewardRate / Math.pow(10, 18)).toFixed(18);
                rewardRate = parseFloat(rewardRate);
                var priceOfPlentyInUSD = getTokenPriceFromName("PLENTY");
                // var priceOfStakeTokenInUsd = 13.97;
                let DPR = 100 * (rewardRate * 2880 * priceOfPlentyInUSD) / (totalSupply * lpPrice);
                cb(DPR);
            });
        });
    });
}

const getPairsData = (callback) => {
    var offset = 0;
    var pageSize = 50;
    var poolsRead = 100;
    getPairsQuery.variables.offset = offset;
    var options = {
        method: 'POST',
        body: JSON.stringify(getPairsQuery),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    var QPPlenty = "KT1X1LgNkQShpF9nRLYw3Dgdy4qp38MX617z";
    var allPairs = [];
    var dataResponse = (dataRes) => {
        dataRes.data.pairs.edges.forEach((pairData) => {
            var poolWRate = poolFee * (pairData.node.volume7d / pairData.node.liquidity);
            var pairInfo = {
                tok1: pairData.node.token1,
                tok2: pairData.node.token2,
                liq: pairData.node.liquidity / TEZ_SUBUNIT,
                contract: pairData.node.id,
                rateDaily: poolWRate / 7,
                rateAnnual: poolWRate * 52
            }
            allPairs.push(pairInfo)
        });
        if (allPairs.length >= poolsRead) {
            getFarmingData((farmData) => {
                farmData.forEach((fdata) => {
                    // refactor ?
                    allPairs.forEach((pdata, pid) => {
                        if (fdata.running && pdata.contract == fdata.quipuswapContract) {
                            allPairs[pid].farm = {
                                apr: parseFloat(fdata.apr),
                                dpr: fdata.apr / 365,
                                farming: fdata.farmingContract
                            };
                        }
                    });
                });
                // Partial callback, Plenty call back will complete
                callback(allPairs);
                // Plenty / XTZ QP Farm on Plenty
                allPairs.forEach((pdata, pid) => {
                    if (pdata.contract == QPPlenty && pdata.tok2.symbol == "PLENTY") {
                        computeQPPlentyFarms(QPPlenty, (dpr) => {
                            allPairs[pid].farm = {
                                apr: dpr * 365,
                                dpr: dpr,
                                farming: "https://plentydefi.com/farms"
                            };
                            callback(allPairs);
                        });
                    }
                });
            });
        } else {
            offset += pageSize;
            getPairsQuery.variables.offset = offset;
            options.body = JSON.stringify(getPairsQuery);
            getPoolsData(options, dataResponse);
        }
    };
    getPairsQuery.variables.offset = offset;
    options.body = JSON.stringify(getPairsQuery);
    getPoolsData(options, dataResponse);
};

export {
    getPairsData
};

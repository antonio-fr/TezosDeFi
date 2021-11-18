

const getPairsQuery = {
    "operationName": "GetPairs",
    "variables": { "limit": 50 },
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
                            console.log(allPairs[pid]);
                        }
                    });
                });
                callback(allPairs);
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

<script>

import { onMount } from 'svelte';
import SvelteTable from "svelte-table";
import {getPairsData} from "../lib/pools";
import openicon from "../assets/openicon.svg";
import calcicon from "../assets/calc.svg";
import swapicon from "../assets/swap.svg";

getPairsData(data => {
    allPairs = data;
    rows = allPairs;
});

var filterToken = (tokenData, tokenName) => {
    if (
        tokenData.tok1.symbol.toLowerCase().startsWith(tokenName.toLowerCase()) ||
        tokenData.tok2.symbol.toLowerCase().startsWith(tokenName.toLowerCase()))
        return true;
    return false;
}
var searchReset = (evt) => {
    document.getElementById("divFilter").value = "";
    rows = allPairs;
}
var searchTokens = (evt) => {
    tokenFilter = evt.target.value;
    if (tokenFilter) {
        rows = allPairs.filter(tokData => {
            return filterToken(tokData, tokenFilter)
        });
    } else {
        tokenFilter = "";
        rows = allPairs;
    }
}
var switchAPR = (evt) => {
    if (rateDisplayed == "DPR") {
        rateDisplayed = "APR";
        columns[2].title = "Rate %/y";
    } else {
        rateDisplayed = "DPR";
        columns[2].title = "Rate %/d";
    }
}
var decoder = document.implementation.createHTMLDocument("New").body;
var neuter = (HTMLstring) => {
    // Sanitize the HTML string using browser capabilities to avoid any XSS
    decoder = decoder || document.implementation.createHTMLDocument("New").body;
    decoder.innerHTML = HTMLstring;
    return decoder.textContent;
}
var renderPair = (pairData) => {
    var tok1Sym = pairData.tok1.symbol;
    var tok2Sym = pairData.tok2.symbol;
    if (!tok1Sym)
      tok1Sym = pairData.tok1.id.slice(0, 6);
    if (!tok2Sym)
      tok2Sym = pairData.tok2.id.slice(0, 6);
    else
      tok2Sym = tok2Sym.slice(0, 6)
    var pairTxt = tok2Sym + " / " + tok1Sym;
    var tokenIdInt = parseFloat(pairData.tok2.tokenId);
    var tokenId = tokenIdInt > 0 ? "_" + tokenIdInt.toFixed(0) : "";
    var linkCode =
      " <a href=\"https://quipuswap.com/liquidity/add/tez-" +
      neuter(pairData.tok2.id) +
      tokenId +
      "\" target=\"blank\"><img class=\"ico\" src=\"" + 
      openicon +
      "\"></a>";
    return neuter(pairTxt) + linkCode;
}
var renderRate = (pairData) => {
    var rateTxt = "";
    if (pairData.farm)
        rateTxt += "<span class=\"farmStriked\">"
    var rate = 0;
    if (rateDisplayed == "DPR") {
        rate = pairData.rateDaily;
        rateTxt += rate.toFixed(pairData.farm?2:3) + " %";
    }
    else {
        rate = pairData.rateAnnual;
        rateTxt += rate.toFixed(1) + " %";
    }
    var newRate = null;
    if (pairData.farm) {
        var farmRate = pairData.farm[rateDisplayed.toLowerCase()]
        if (rateDisplayed == "DPR")
          newRate = (((1+pairData.rateDaily/100)*(1+farmRate/100))-1)*100
        else
          newRate = (((1+pairData.rateAnnual/100)*(1+farmRate/100))-1)*100
        var farmLink = neuter(pairData.farm.farming);
        if (farmLink != "https://plentydefi.com/farms")
          farmLink = "https://app.tzwrap.com/liquidity-mining/op/" + farmLink + "/stake";
        rateTxt += "</span><span class=\"farmAdd\"> " +
          "<a class=\"farmLink\" href=\"" +
          farmLink +
          "\" target=\"blank\">" +
          newRate.toFixed(rateDisplayed == "DPR" ? 2 : 0) +
          "%</a></span>";
    }
    if (newRate!=null)
      rate = newRate;
    rateTxt += "<a href=\"#/graph?rate=" +
               rate.toFixed(rateDisplayed == "DPR" ? 3 : 1) +
               ((rateDisplayed=="DPR")?"&type=dpr":"");
    rateTxt += "\" use:link><img class=\"calcico\" src=\"" + calcicon + "\"></a>";
    return rateTxt;
}
var rows = [];
var allPairs = [];
var tokenFilter = "";
var rateDisplayed = "DPR";
const columns = [{
        key: "assets",
        title: "Assets pair",
        value: v => v.tok2.symbol.toLowerCase(),
        renderValue: renderPair,
        sortable: true,
        headerClass: "text-left",
    }, {
        key: "liq",
        title: "Liquidity tz",
        renderValue: v => v.liq.toFixed(0),
        value: v => v.liq,
        sortable: true,
        filterValue: v => v.liq,
    }, {
        key: "rate",
        title: "Rate %/d",
        value: v => v.rateDaily,
        renderValue: renderRate,
        sortable: true,
    },
];
onMount(e=>document.getElementsByTagName("main")[0].style["max-width"] = "650px");

</script>


    <h2 class="my-4">
      LP deposit rates on
      <a href="https://quipuswap.com/liquidity/" class="has-text-weight-semibold" target="blank">
        Quipuswap
      </a>
      <br>
      and farming with
      <a href="https://www.plentydefi.com/farms" class="has-text-weight-semibold" target="blank">
        Plenty
      </a>
    </h2>

    {#if rows.length || tokenFilter}
      <div class="dfilter field is-flex is-justify-content-space-between mb-1 mt-5">
        <div class="control has-icons-right" id="tokFilter">
          <input 
            id="divFilter"
            class="input is-small"
            type="text"
            on:keyup={searchTokens}
            placeholder="Filter token"
          >
          <div class="icon is-small is-right">
            <div
              class="delete"
              on:click={searchReset}>
            </div>
          </div>
        </div>
        <div
          class="button is-small btnapr"
          on:click={switchAPR}
        >
          DPR<img class="ico swapico" alt="swap arrows" src={swapicon}>APR
        </div>
      </div>
      <div class="mx-0 mb-4">
        <SvelteTable 
          class="table"
          columns="{columns}"
          rows="{rows}"
          classNameRow="tableRow"
          sortBy= "rate",
          sortOrder= -1
        />
      </div>
    {:else }
      <h2 class="my-5">Loading data ...</h2>
    {/if}


<style>

  a {
    color: #0d2b4e;
  }
  :global(.farmLink) {
    color: #0d2b4e;
    border-bottom: 1px solid #0d2b4e;
    padding: 0 0 0px;
  }
  .btnapr {
    margin-right: 18px;
  }
  .input:focus, .input:active {
    border-color: #0d2b4e;
  }
  .dfilter {
    text-align: left;
  }
  :global(.ico) {
    width: 14px;
  }
  :global(.calcico) {
    width: 15px;
    margin-left: 1px;
  }
  .swapico {
    margin: 1px 5px 0;
  }
  #tokFilter {
    margin-left: 8px;
    width: 130px;
    background-color: #FEFEFE;
    border-color: #858da2;
  }
  h2 {
    font-size: 1.2em;
  }
  :global(.tableRow) {
    height: 40px;
    border-bottom: 1px solid #D8D8D8;
  }
  :global(.tableRow:last-child) {
    border-bottom: none;
  }
  :global(table td) {
    vertical-align: middle !important;
  }
  :global(.farmAdd) {
    font-size: 0.95rem;
  }
  :global(.farmStriked) {
    font-size: 0.8rem;
    text-decoration: line-through;
    text-decoration-thickness: 2px;
  }
  
  @media (min-width: 480px) {
    #tokFilter {
      margin-left: 32px;
      width: 140px;
    }
    .btnapr {
      margin-right: 36px;
    }
  }

</style>

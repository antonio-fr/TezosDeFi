<script>

  import {onMount} from 'svelte';
  import {querystring} from 'svelte-spa-router';
  import Line from "svelte-chartjs/src/Line.svelte";


  // Default values
  var qrobj;
  var rate;
  var days;
  $: {
      qrobj = new URLSearchParams($querystring);
      loadData();
  }
  var inputRate = "APR";
  var tickStep = 20; // 100% / 20 = 5%
  var maxVar = 4;    // +300%

  var maxGain = "";
  var ROI = "";
  var beatHold = ["",""];
  var generateX = (v, i) => {
    return (i*0.05)+0.05;
  };
  var genLabels = (x) => {
    var pcVar = (x-1)*100;
    var pcVarStr = "";
    if (pcVar > 0)
      pcVarStr += "+ " + pcVar.toFixed(0);
    if (pcVar < 0)
      pcVarStr += "- " + (-pcVar).toFixed(0);
    if (pcVar == 0)
      pcVarStr += "0";
    return pcVarStr + " %";
  }
  var holdValue = (x) => {
    return (x+1)/2;
  };
  var gainVShold = (x, amount) => {
    // Gain of the amount relative to hold
    return amount / holdValue(x);
  };
  var LPgain = (x) => {
    var gain = rate/100*days;
    if (inputRate=="APR")
      gain /= 365;
    return Math.sqrt(x) * 100 * (1+gain);
  };
  var relGain = (x) => {
    return gainVShold(x, LPgain(x));
  };
  
  var solveGainLimit = () => {
    // Minimum price change to ROI
    var effRate = rate/100*days;
    if (inputRate=="APR")
      effRate /= 365;
    return 100*(1/((1+effRate)*(1+effRate))-1);
  };
  var solveBeatHold = () => {
    // Prices change bounds to overperform hold
    var effRate = rate/100*days;
    if (inputRate=="APR")
      effRate /= 365;
    var baseLimit = (effRate*effRate)+2*effRate;
    var SqDiscrim = Math.sqrt(effRate*(effRate+1)*(effRate+1)*(effRate+2));
    return [200*(baseLimit-SqDiscrim), 200*(baseLimit+SqDiscrim)];
  };

  var xTick = Array.from({length:tickStep*maxVar}, generateX);
  var gainData = xTick.map(LPgain);
  var relGainData = xTick.map(relGain);
  var holdData = xTick.map(x => 100*holdValue(x))
  
  var getHeightRatio = () => {
    if (window.innerWidth <= 650)
      return 0.9;
    else if (window.innerWidth <= 900)
      return 1.5;
    return 2;
  };
  var changeInputRate = (evt) => {
    inputRate = evt.target.value;
    refreshData();
  }
  var refreshData = () => {
    data.datasets[0].data = xTick.map(LPgain);
    data.datasets[1].data = xTick.map(relGain);
    maxGain = (LPgain(1)-100).toFixed(1);
    ROI = solveGainLimit().toFixed(1);
    beatHold = solveBeatHold().map(l=>l.toFixed(1));
  };
  let data = {
    labels: xTick.map(genLabels),
    datasets: [
      {
        label: "Gain",
        borderColor: "#000f89",
        borderWidth: 3,
        borderJoinStyle: "round"
      },
      {
        label: "Relative",
        borderColor: "#32cd32",
        borderWidth: 3,
        borderJoinStyle: "round"
      },
      {
        label: "Hold",
        data:holdData,
        borderColor: "#ff7f50",
        borderWidth: 2,
        borderDash: [20, 8],
        borderJoinStyle: "round"
      },
      {
        label: "Flat ROI",
        data: Array.from({length:tickStep*maxVar}, x=>100),
        borderColor: "#F60026",
        borderWidth: 1,
        borderDash: [8, 8],
        borderJoinStyle: "round"
      },
      
    ],
    
  };
  let options = {
    aspectRatio: getHeightRatio(),
    responsive: true,
    animation: {duration:200},
    elements: {
        point: {
          radius: 0,
          hitRadius: 8,
          hoverRadius: 8
        },
    },
    plugins: {
      legend: {
        position: 'top',
        maxHeight: 30,
        labels: {
            boxHeight:0,
            boxWidth: 20
        }
      },
      title: {
        display: false,
      }
    }
  }
window.addEventListener('resize', (evt) => {
  options.aspectRatio = getHeightRatio();
});
var loadData = () => {
  document.getElementsByTagName("main")[0].style["max-width"] = "1200px";
  rate = qrobj.get("rate")?qrobj.get("rate"):70 // APR %
  days = qrobj.get("days")?qrobj.get("days"):30 // days period
  var titleDOM = document.getElementsByTagName("h2")[0]
  if(titleDOM)
    titleDOM.scrollIntoView();
  var selectClassDOM = document.getElementsByClassName('select')[0];
  if (selectClassDOM) {
    var selectDOM = selectClassDOM.firstChild;
    selectDOM.value = "APR";
    if (qrobj.get("type") && qrobj.get("type").toLowerCase() == "dpr") {
      selectDOM.value = "DPR";
      inputRate = "DPR";
    }
  }
  refreshData();
};
onMount(loadData);
</script>


  <h2 class="my-4">
    LP graph calculator
  </h2>
  <div class="mt-2 mb-0 box">
    <div class="graphHeader">
      <b>One side variation limits</b><br>
      Maximum gain : +{maxGain} % <br>
      R.O.I. breakeven : {ROI} % and above<br>
      Beat the hold : {beatHold[0]}% to +{beatHold[1]}%
    </div>
    <Line
      data={data}
      options={options}
      class="graph"
    />
  </div>
  <div class="graphTitle my-0 is-size-7">LP gain VS one side variation</div>
  <div class="columns is-mobile mt-2 mb-0">
    <div class="column p-1 is-offset-1 is-flex is-justify-content-end">
      <div class="column p-1 is-flex is-justify-content-end is-align-items-center mr-2">
        Rate
      </div>
      <input 
        class="input"
        type="text"
        placeholder={inputRate}
        bind:value={rate}
        on:keyup={refreshData}
      >
    </div>
    <div class="column p-1 has-text-left is-flex is-align-items-center ml-0">
      <div class="select" on:change={changeInputRate}>
        <select>
          <option value="DPR">% DPR</option>
          <option value="APR" selected>% APR</option>
        </select>
      </div>
    </div>
  </div>
  <div class="columns is-mobile mt-0 mb-3">
    <div class="column is-offset-1 is-justify-content-end p-1 is-flex is-align-items-center ml-3">
      deposit duration (days)
    </div>
    <div class="column p-1 is-flex is-justify-content-start">
      <input 
        class="input"
        type="text"
        placeholder="Days"
        bind:value={days}
        on:keyup={refreshData}
      >
    </div>
  </div>
  
  <div class="example mb-4">
    The X axis is the variation of one side. Like a half token side in the liquidity pool.<br>
    At the start of the period, fund is shared 50%/50% in the 2 sides of the liquidity pool.<br><br>
    
    Blue line : What is the value you get by depositing $100 in liquidity after the defined period.<br>
    Green line : Relative percentage compared to the same amount kept as "holding" the 2 assets.<br>
    Orange dashed : What is the value you get by just "holding" the 2 assets. The green line is the ratio (or gap) between this orange line and the the blue line.<br>
    Red horizontal : What is the value you get by keeping 100 stable units, like keeping fund as $100, you always get $100. This is the "ground 0 ROI" reference line.<br>
    
    <br>Blue curve is above the orange dashed diagonal = Green curve is above the red horizontal "unit" : you gain money relative to keeping 50/50 coins aka "hold". Opposite : Blue is below the orange dashed = Green is below the horizontal "unit" = you lose money relative to keeping coins.<br>
    
    Blue curve is above the red horizontal "unit" : you gain money from the beginning (but possibly less than holding because of impermanent losses). You'll end up with more than $100. Opposite : Blue is below the red horizontal "unit" : you lose money from the beginning. You'll end up with less than $100.<br>
    

    <br>Examples : With APR = 70%, during 90 days<br>
    - Both sides stable, no side gain nor lose (x=0%) : you gain the full rate reward 17.3 %, which is also +17.3% than holding.<br>
    - The half coin side gains 85% (x=+85%) : you gain 59.5 %, which is +11.9% than holding.<br>
    - The half coin side loses 40% (x=-40%) : you lose 9.2 % (100-90.8), although value is +13.5% than holding.<br>
    - The half coin side loses 80% (x=-80%) : you lose 47.6 % (100-52.4), which is 11.9% worse than holding.<br>
    <br>Conditions :<br>
    - The other half side is fixed. This theory is good when one side of the liquidity is a stable coin (USDT, jEUR...), or your point of reference (XTZ, BTC, ETH,...).<br>
    - It doesn't take in account any trading, order, transaction fee. It supposes the fees to deposit and remove the liquidity are null or at least negligeable relative to the balance.<br>
    - If the rate includes an external farming reward denominated in a token, the computed result is for the current price of the reward token.
  </div>


<style>

  h2 {
    font-size: 1.2em;
  }
  input {
    max-width: 80px;
    background-color: #FCFCFD;
  }
  select:not([multiple]) {
    padding-right: 1.8rem;
    background-color: #FCFCFD;
  }
  .example {
    font-size: 0.8rem;
    text-align: justify;
    padding: 0.5rem 1.25rem;
  }
  .box {
    background-color: #FCFCFD;
    margin-left: auto;
    margin-right: auto;
  }
  .graphHeader {
    display: inline-block;
    padding: 1rem;
    border-width: 1px;
    border-style: solid;
    border-color: #0d2b4e;
    border-radius: 3px;
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
  @media (max-width: 531px) {
    .graphHeader {
      padding: 0.75rem 0.36rem;
      font-size: 1rem;
    }
  }

</style>


<script>

  import { onMount } from 'svelte';
  import {push} from 'svelte-spa-router';
  import logo from "../assets/tdefi.png";
  onMount(e=>document.getElementsByTagName("main")[0].style["max-width"] = "650px");

</script>


  <img src={logo} alt="TezosDefiLogo" class="logohome mb-4">

  <div>
    <button
      class="button is-large smtxt mb-4"
      on:click={e=>push('/lprates')}
    >
      Liquidity Pool Provider Rates
    </button>
    <button
      class="button is-large smtxt mb-5"
      on:click={e=>push('/graph')}
    >
      Graph calculator
    </button>
  </div>


<style>

.logohome {
  width: 80px;
  height: 80px;
}
.smtxt {
  font-size: 1.3rem;
  border-radius: 8px;
}

.button:hover {
  border-width: 2px;
}

</style>

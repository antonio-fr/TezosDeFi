<script>

  import Router from 'svelte-spa-router';
  import {location} from 'svelte-spa-router';
  import Back from "./routes/Back.svelte";
  import Home from "./routes/Home.svelte";
  import Lppage from "./routes/Lppage.svelte";
  import Graph from "./routes/Graph.svelte";
  import email from "./assets/email.svg";

  const routes = {
    '/lprates': Lppage,
    '/graph': Graph,
    '*': Home,
  }

</script>


<main>
  <h1>Tezos De.Fi</h1>

  {#if $location!="/"}
    <Back />
  {/if}
  <Router {routes}/>

</main>

  <div class="mfooter">
    <a
      class="button is-info is-outlined mb-4 mt-2"
      href="mailto:contact@tezosde.fi"
    >
      Contact
      <img src={email} alt="letter" class="emailicon mb-4">
    </a>
    <div class="mb-4 is-size-7">
      <a href="/">TezosDe.Fi</a> - Made with greed by <a href="https://github.com/antonio-fr/TezosDeFi" target="_blank">@antonio-fr</a> - Supported&nbsp;by&nbsp;<a href="https://bitlogik.fr" target="_blank">BitLogiK</a>
    </div>
  </div>


<style>
  :root {
    font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "Helvetica",
    "Arial", sans-serif !important;
    background-color: #E8E8EB;
    font-size: 16px;
  }
  main {
    text-align: center;
    padding: 0.5em;
    margin: 1.6rem auto 0;
    max-width: 500px;
    background-color: #F4F6F9;
  }
  a {
    color: #0d2b4e;
  }
  h1 {
    color: #0d2b4e;
    font-size: 2rem;
    font-weight: 600;
    line-height: 1.1;
    margin: 1.2rem auto;
    max-width: 14rem;
  }
  .mfooter {
    text-align: center;
    max-width: none;
    margin: 1rem auto;
    line-height: 1.35;
  }
  .emailicon {
    height: 1.5em;
    margin: auto 0 auto 8px;
  }

  @media (min-width: 490px) {
    :root {
        font-size: 18px;
    }
    main {
      padding: 3.2em;
      border-radius: 32px;
      max-width: 640px;
    }
    h1 {
      max-width: none;
    }
  }

  @media (max-width: 341px) {
    :root {
        font-size: 12.5px;
    }
  }
  
  @media (min-height: 800px) {
    main {
      margin-top: 100px;
    }
  }

</style>

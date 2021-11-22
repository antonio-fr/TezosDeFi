
<script>
  import {push} from 'svelte-spa-router';
  import back from "../assets/back.svg";
</script>


  <div
    class="button is-info is-small is-outlined mb-1 mt-2"
    on:click={e=>push('/')}
  >
    <img src={back} alt="back" class="backicon">
    Back
  </div>


<style>

.backicon {
  height: 1.5em;
  margin: auto 8px auto 0;
}

</style>

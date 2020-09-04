<script>
  export let colors = []
  import Chart from 'color-contrast-table-svelte'
  import { activeAction, colorPalette } from '../stores.js'

  let action
  activeAction.subscribe(currentAction => {
    action = currentAction
  })

  colorPalette.set(colors)

  $: editable = action === 'editColors'
</script>

<style>
  #table {
    font-size: 1em;
    width: 100%;
  }

  :global(#table table) {
    position: relative;
    width: 100%;
  }

  :global(#table th) {
    position: sticky;
    left: 0;
    z-index: 100;
  }

  :global(#table table input:focus) {
    outline: unset !important;
    box-shadow: none !important;
  }
</style>

<div id='table'>
  {#if editable}
    <Chart 
      useStyles
      colors={colors}
      editNames
      editValues
    />
  {:else}
    <Chart 
      useStyles
      colors={colors}
    />
  {/if}
</div>
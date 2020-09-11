<script>
  import Chart from 'color-contrast-table-svelte'
  import { data, actions } from '../stores.js'


  $: editable = $actions.current === 'editColors'
</script>

<style>
  #table {
    font-size: 1em;
    width: 100%;
    max-height: 100%;
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
  <Chart 
    useStyles
    colors={$data.colors}
    editNames={editable}
    editValues={editable}
    onBlur={() => null}
  />
</div>
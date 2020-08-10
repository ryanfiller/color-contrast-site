<script>
  export let colors = []
  import Chart from 'color-contrast-table-svelte'
</script>

<style>
  /* #table {
    width: 100%;
  } */

  :global(#table table) {
    width: 100%;
    position: relative;
  }

  :global(#table th) {
    position: sticky;
    left: 0;
    z-index: 100;
  }
</style>

<div id='table'>
  <Chart 
    class='testing'
    colors={colors}
    editName
    editValues
    useStyles
  />
</div>
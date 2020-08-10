<script>
  export let colors = []
  import Chart from 'color-contrast-table-svelte'
</script>

<style>
  :global(#table table) {
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
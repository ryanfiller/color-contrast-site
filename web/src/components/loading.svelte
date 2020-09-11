<script>
  import Loading from '../../static/icons/loading.svg'
</script>

<style>
  @keyframes spin {
    from {
      transform: rotate(0deg) scale(1);
      opacity: .75;
    }
    50% {
      transform: rotate(90deg) scale(1.125);
      opacity: 1;
    }
    to {
      transform: rotate(180deg) scale(1);
      opacity: .75;
    }
  }

  .loading :global(svg) {
    animation-name: spin;
    animation-duration: .75s;
    animation-iteration-count: infinite;
    animation-timing-function: linear; 
  }

  :global(main .loading svg) {
    height: 5rem;
    width: 5rem;
  }

  .loading :global(svg *) {
    fill: var(--backgroundColor);
  }
</style>

<div class='loading'>
  <Loading />
</div>
<script>
  export let title = ''
  export let action = () => {}
</script>

<style>
  button {
    border: none;
    background: var(--backgroundColor);
    padding: var(--borderSize);
    cursor: pointer;
    border-radius: 50%;
    margin-left: 1rem;
  }

  button :global(svg) {
    display: block;
    height: 1.25rem;
    width: 1.25rem;
  }

  button :global(svg * ) {
    fill: var(--textColor);
  }
</style>

<button
  title={title}
  on:click={action}
>
  <slot />
</button>
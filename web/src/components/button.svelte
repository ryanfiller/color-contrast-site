<script>
  export let title = ''
  export let action = () => {}
  export let active = false
</script>

<style>
  button {
    background: var(--textColor);
    padding: calc(.5 * var(--borderSize));
    border: calc(.5 * var(--borderSize)) solid var(--backgroundColor);
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
    fill: var(--backgroundColor);
  }

  button.active {
    background: var(--backgroundColor);
  }

  button.active :global(svg * ) {
    fill: var(--textColor);
  }
</style>

<button
  title={title}
  on:click={action}
  class:active={active}
>
  <slot />
</button>
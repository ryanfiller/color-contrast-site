<script>
  import Add from '../../static/icons/add.svg'
  import Code from '../../static/icons/code.svg'
  import Download from '../../static/icons/download.svg'
  import Edit from '../../static/icons/edit.svg'
  import Save from '../../static/icons/save.svg'
  import Sun from '../../static/icons/sun.svg'
  import Moon from '../../static/icons/moon.svg'
  import Loading from './loading.svelte'

  const icons = {
    add: Add,
    code: Code,
    download: Download,
    edit: Edit,
    save: Save,
    sun: Sun,
    moon: Moon,
    loading: Loading
  }

  export let title = ''
  export let icon = ''
  export let action = () => {}
  export let active = false
  export let disabled = false
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

  button[disabled] {
    opacity: .5;
    cursor: not-allowed;
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
  title={disabled ? `uh oh, there's a data error` : title}
  on:click={action}
  class:active={active}
  disabled={disabled}
>
  <svelte:component this={icons[icon]} />
</button>
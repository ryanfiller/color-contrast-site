<script>
  import { actions } from '../stores.js'

  import Add from '../../static/icons/add.svg'
  import Code from '../../static/icons/code.svg'
  import Download from '../../static/icons/download.svg'
  import Edit from '../../static/icons/edit.svg'
  import Save from '../../static/icons/save.svg'

  const icons = {
    add: Add,
    code: Code,
    download: Download,
    edit: Edit,
    save: Save
  }

  let buttons
  const unsubscribe = actions.subscribe(actions => {
    buttons = actions
  })
</script>

<style>
  ul {
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  button {
    border: none;
    background: var(--primaryColor);
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
    fill: var(--secondaryColor);
  }
</style>

<ul>
  {#each buttons as button}
    <li>
      <button
        title={button.text}
        on:click={button.action}
      >
        <svelte:component this={icons[button.icon]}/>
      </button>
    </li>
  {/each}
</ul>
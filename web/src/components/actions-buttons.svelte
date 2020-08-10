<script>
  import { onMount, beforeUpdate } from 'svelte' 
  import { actions, activeAction } from '../stores.js'
  import Button from './button.svelte'
  import DarkMode from './dark-mode.svelte'

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
    save: Save,
  }

  let buttons
  let currentAction
  actions.subscribe(actions => {
    buttons = actions
  })

  activeAction.subscribe(activeAction => {
    currentAction = activeAction
  })

</script>

<style>
  ul {
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>

<ul>
  {#each buttons as button}
    <li>
      <Button
        title={button.text}
        action={button.action}
        active={button.active || currentAction === button.title}
      >
        <svelte:component this={icons[button.icon]}/>
      </Button>
    </li>
  {/each}
  <li>
    <DarkMode />
  </li>
</ul>
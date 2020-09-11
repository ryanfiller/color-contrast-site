<script>
  import { actions } from '../stores.js'
  import Button from './button.svelte'
  import DarkMode from './dark-mode.svelte'
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
  {#each $actions.buttons as button}
    <li>
      <Button
        title={button.text}
        icon={button.icon}
        action={button.action}
        active={$actions.current === button.title}
      />
    </li>
  {/each}
  <li>
    <DarkMode />
  </li>
</ul>
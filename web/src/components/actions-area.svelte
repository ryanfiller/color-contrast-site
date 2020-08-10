<script>
  import { activeAction } from '../stores.js'

  let action
  activeAction.subscribe(currentAction => {
    action = currentAction
  })
</script>

<style>
  section {
    color: var(--textColor);
    background-color: var(--backgroundColor);
    padding: calc(4 * var(--borderSize)) calc(2 * var(--borderSize));
    font-size: 1.5em;
  }
</style>

{#if !!action}
  <section>
    current action is "{action}"
  </section>
{/if}
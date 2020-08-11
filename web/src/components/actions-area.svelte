<script>
  import { activeAction, colorPalette } from '../stores.js'
  import Button from './button.svelte'
  import Save from '../../static/icons/save.svg'

  let action
  activeAction.subscribe(currentAction => {
    action = currentAction
  })

  const clickOutside = (node) => {  
    const handleClick = event => {
      if (node && !node.contains(event.target)) {
        node.dispatchEvent(new CustomEvent('clickOutside', node))
      }
    }
  	document.addEventListener('click', handleClick, true);
    return { destroy() { document.removeEventListener('click', handleClick, true) }}
  }

  const handleClearAction = () => {
    if (action !== 'editColors' ) {
      return activeAction.set('')
    }
  }

  let colors
  colorPalette.subscribe(currentColorPalette => {
    colors = currentColorPalette
  })

  let newOwner = ''
  let newPalette = ''
  let newColor = {name: '', value: ''}
  let jsonCode = ''

  const sanityCreate = data => {
    fetch('/.netlify/functions/sanity', {
      method: 'POST', 
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(response => response.json())
    .then(response => console.log('response', response))
    .catch(error => console.log('error', error))
  }

  const createNewOwner = () => {
    sanityCreate({
      _type: 'owner',
      name: newOwner,
    })
  }
</script>

<style>
  section {
    color: var(--textColor);
    background-color: var(--backgroundColor);
    padding: calc(4 * var(--borderSize)) calc(2 * var(--borderSize));
    display: flex;
    gap: calc(4 * var(--borderSize));
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    font-size: 1em;
  }

  label {
    color: var(--textColor);
    display: flex;
    gap: calc(2* var(--borderSize));
    flex-direction: row-reverse;
    align-items: center;
  }

  input,
  textarea {
    color: var(--backgroundColor);
    background-color: var(--textColor);
    padding: calc(2 * var(--borderSize));
    border: none;
    font-size: 1.25em;
  }

  textarea {
    font-size: 1rem;
    box-sizing: border-box;
    resize: none;
    width: 50ch;
  }

  section :global(button) {
    padding: calc(2 * var(--borderSize));
  }
  section :global(button svg) {
    height: 2rem;
    width: 2rem;
  }
</style>

{#if !!action}
  <section use:clickOutside on:clickOutside={handleClearAction}>
    {#if action === 'addUser'}
      <label for='new-owner'>
        <input 
          type="text"
          id='new-owner'
          name='new-owner'
          bind:value={newOwner}
        />
        <span>add a new user:</span>
      </label>
      <Button
        text='save user'
        action={createNewOwner}
      >
        <Save />
      </Button>
    {:else if action === 'addPalette'}
      <label for='new-palette'>
        <input 
          type="text"
          id='new-palette'
          name='new-palette'
          bind:value={newPalette}
        />
        <span>add a new color palette:</span>
      </label>
      <Button
        text=''
        action={() => console.log('button click', newPalette)}
      >
        <Save />
      </Button>
    {:else if action === 'addColor'}
      <label for='new-color-name'>
        <input 
          type="text"
          id='new-color-name'
          name='new-color-name'
          bind:value={newColor.name}
        />
        <span>new color name:</span>
      </label>
      <Button
        text=''
        action={() => console.log('button click', newColor)}
      >
        <Save />
      </Button>
      <label for='new-color-value'>
        <input 
          type="text"
          id='new-color-value'
          name='new-color-value'
          bind:value={newColor.value}
        />
        <span>new color value:</span>
      </label>
      <Button
        text=''
        action={() => console.log('button click', newColor)}
      >
        <Save />
      </Button>
    {:else if action === 'editColors'}
      click a color name or value to change it
    {:else if action === 'seeCode'}
      <label for='colors-json'>
        <textarea
          rows={(colors.length * 4) + 1}
          type="text"
          id='colors-json'
          name='colors-json'
          value={JSON.stringify(colors, null, '  ')}
          on:input={event => colors = JSON.parse(event.target.value)}
        />
        <span>copy or edit the code</span>
      </label>
      <Button
        text=''
        action={() => console.log('button click', colors)}
      >
        <Save />
      </Button>
    {/if}
  </section>
{/if}
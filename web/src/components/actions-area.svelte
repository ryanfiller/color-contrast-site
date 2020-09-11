<script>
  import { data, actions } from '../stores.js'
  import Button from './button.svelte'
  import Save from '../../static/icons/save.svg'
  import { slugify } from '../helpers.js'

  const clickOutside = (node) => {  
    const handleClick = event => {
      if (node && !node.contains(event.target)) {
        node.dispatchEvent(new CustomEvent('clickOutside', node))
      }
    }
  	document.addEventListener('click', handleClick, true)
    return { destroy() { document.removeEventListener('click', handleClick, true) }}
  }

  const handleClearAction = () => {
    if ($actions.current !== 'editColors' ) {
      return $actions.current = null
    }
  }

  document.addEventListener('keydown', event => {
    if (event.keyCode === 27) {
      return $actions.current = null
    }
  })

  let owner = ''
  let palette = ''
  let color = {name: '', value: ''}
  let jsonCode = '{}'

  const sanityPost = (endpoint, data) => {
    fetch(`/.netlify/functions/${endpoint}`, {
      method: 'POST', 
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(response => response.json())
    .then(response => console.log('response', response))
    .catch(error => console.log('error', error))
  }

  const createNewOwner = () => {
    sanityPost('create', {
      _type: 'owner',
      name: owner,
      slug: slugify(owner)
    })
  }

  const createNewPalette = () => {
    sanityPost('create', {
      _type: 'palette',
      title: palette,
      slug: slugify(palette),
      colors: [],
      owner: {
        _ref: $data.owner.id,
        _type: 'reference'
      }
    })
  }


  const createNewColor = () => {
    sanityPost('mutate', [
      {
        patch: {
          id: $data.palette.id,
          insert: {
            after: 'colors[-1]',
            items: [
              {
                name: color.name,
                value: color.value
              }
            ]
          }
        }
      }
    ])
  }

  const saveColors = () => {
    sanityPost('mutate', [
      {
        createOrReplace: {
          _id: $data.palette.id,
          _type: 'palette',
          title: $data.palette.title,
          slug: $data.palette.slug,
          owner: {
            _ref: $data.owner.id,
            _type: 'reference'
          },
          colors: $data.colors
        }
      }
    ])
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
    margin: 0;
    font-size: 1.25em;
  }

  input#new-color-value {
    padding: 0;
    height: calc(1.5em + (2 * var(--borderSize)));
    width: calc(1.5em + (2 * var(--borderSize)));
  }

  textarea {
    font-size: 1rem;
    box-sizing: border-box;
    resize: none;
    width: 50ch;
    max-height: 25vh;
  }

  section :global(button) {
    padding: calc(2 * var(--borderSize));
  }
  section :global(button svg) {
    height: 2rem;
    width: 2rem;
  }
</style>

<!-- TODO - make this submit with enter, reset focus -->
<!-- TODO - make sure you can't submit duplicate stuff -->
<!-- TODO - abstract input and submit button -->

{#if !!$actions.current}
  <section use:clickOutside on:clickOutside={handleClearAction}>
    {#if $actions.current === 'addUser'}
      <label for='new-owner'>
        <input 
          type='text'
          id='new-owner'
          name='new-owner'
          bind:value={owner}
        />
        <span>add a new user:</span>
      </label>
      <Button text='save user' action={createNewOwner}><Save /></Button>
    {:else if $actions.current === 'addPalette'}
      <label for='new-palette'>
        <input 
          type='text'
          id='new-palette'
          name='new-palette'
          bind:value={palette}
        />
        <span>add a new color palette:</span>
      </label>
      <Button text='save palette' action={createNewPalette}><Save /></Button>
    {:else if $actions.current === 'addColor'}
      <label for='new-color-name'>
        <input 
          type='text'
          id='new-color-name'
          name='new-color-name'
          bind:value={color.name}
        />
        <span>new color name:</span>
      </label>
      <label for='new-color-value'>
        <input 
          type='color'
          id='new-color-value'
          name='new-color-value'
          bind:value={color.value}
        />
        <span>new color value:</span>
      </label>
      <Button text='save color' action={createNewColor}><Save /></Button>
    {:else if $actions.current === 'editColors'}
      <span>click a color name or value to change it</span>
      <Button text='save all colors' action={saveColors}><Save /></Button>
    {:else if $actions.current === 'seeCode'}
      <label for='colors-json'>
        <textarea
          rows={($data.colors.length * 4) + 1}
          type='text'
          id='colors-json'
          name='colors-json'
          value={JSON.stringify($data.colors, null, '  ')}
          on:input={event => $data.colors = !!event.target.value ? JSON.parse(event.target.value) : []}
        />
        <span>copy or edit the code</span>
      </label>
      <Button text='save all colors' action={saveColors}><Save /></Button>
    {/if}
  </section>
{/if}
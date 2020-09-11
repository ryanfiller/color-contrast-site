<script>
  import { onMount } from 'svelte'
  let focus = null
  onMount(() => focus.focus())

  import { data, actions } from '../stores.js'
  import Button from './button.svelte'
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
      $actions.current = null
      $actions.error = false
    }
  }

  document.addEventListener('keydown', event => {
    if (event.keyCode === 27) {
      $actions.current = null
      $actions.error = false
    }
  })

  const submit = (event, data) => {
    event.preventDefault()
  }

  let owner = ''
  let palette = ''
  let color = {name: '', value: '#ff1493'}
  let jsonCode = '{}'

  const sanityPost = (endpoint, data) => {
    fetch(`/.netlify/functions/${endpoint}`, {
      method: 'POST', 
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(response => response.json())
    .then(response => {
      console.log('response', response)
      $actions.current = null
    })
    .catch(error => console.log('error', error))
  }

  const createNewOwner = () => {
    if ($data.owners.filter(o => o.slug === owner).length) {
      $actions.error = true
    } else {
      $actions.error = false
      sanityPost('create', {
        _type: 'owner',
        name: owner,
        slug: slugify(owner)
      })
    }
  }

  const createNewPalette = () => {
    if ($data.palettes.filter(p => p.slug === palette).length) {
      $actions.error = true
    } else {
      $actions.error = false
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
  }


  const createNewColor = () => {
    if ($data.colors.filter(c => (c.name === color.name && c.value === color.value)).length) {
      $actions.error = true
    } else {
      $actions.error = false
      sanityPost('mutate', [
        {patch: {
          id: $data.palette.id,
          insert: {
            after: 'colors[-1]',
            items: [ { name: color.name, value: color.value } ]
          }
        }}
      ])
    }
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
  form {
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

  form:focus {
    box-shadow: none !important;
  }

  label {
    color: var(--textColor);
    display: flex;
    gap: calc(2* var(--borderSize));
    flex-direction: row-reverse;
    align-items: center;
  }

  span {
    display: block;
  }

  span.error {
    color: var(--highlight);
    width: 100%;
    text-align: center;
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

  form :global(button) {
    padding: calc(2 * var(--borderSize));
  }
  form :global(button svg) {
    height: 2rem;
    width: 2rem;
  }
</style>

<form
  id='action'
  on:submit={submit}
  bind:this={focus}
  tabindex='-1'
  use:clickOutside
  on:clickOutside={handleClearAction}
>
  {#if $actions.current === 'addUser'}
    <label for='new-owner'>
      <input
        aria-invalid={$actions.error}
        aria-describedby="new-owner-error"
        type='text'
        id='new-owner'
        name='new-owner'
        bind:value={owner}
      />
      <span>add a new user:</span>
    </label>
    <Button title='save user' icon='save' action={createNewOwner} />
    {#if $actions.error}
      <span class='error' id='new-owner-error'>that user already exists!</span>
    {/if}

    {:else if $actions.current === 'addPalette'}
    <label for='new-palette'>
      <input
        aria-invalid={$actions.error}
        aria-describedby="new-palette-error"
        type='text'
        id='new-palette'
        name='new-palette'
        bind:value={palette}
      />
      <span>add a new color palette:</span>
    </label>
    <Button title='save palette' icon='save' action={createNewPalette} />
    {#if $actions.error}
      <span class='error' id='new-palette-error'>that palette already exists!</span>
    {/if}

    {:else if $actions.current === 'addColor'}
    <label for='new-color-name'>
      <input
        aria-invalid={$actions.error}
        aria-describedby="new-color-error"
        type='text'
        id='new-color-name'
        name='new-color-name'
        bind:value={color.name}
      />
      <span>new color name:</span>
    </label>
    <label for='new-color-value'>
      <input
        aria-invalid={$actions.error}
        aria-describedby="new-color-error"
        type='color'
        id='new-color-value'
        name='new-color-value'
        bind:value={color.value}
      />
      <span>new color value:</span>
    </label>
    <Button title='save color' icon='save' action={createNewColor} />
    {#if $actions.error}
      <span class='error' id='new-color-error'>that color already exists!</span>
    {/if}

    {:else if $actions.current === 'editColors'}
    <span>new color value:</span>
    <Button title='save all colors' icon='save' action={saveColors} />

    {:else if $actions.current === 'seeCode'}
    <label for='colors-json'>
      <textarea
        aria-invalid={$actions.error}
        aria-describedby="colors-json-error"
        rows={($data.colors.length * 4) + 1}
        type='text'
        id='colors-json'
        name='colors-json'
        value={JSON.stringify($data.colors, null, '  ')}
        on:input={event => $data.colors = !!event.target.value ? JSON.parse(event.target.value) : []}
      />
      <span>copy or edit the code</span>
    </label>
    <Button title='save all colors' icon='save' action={saveColors} />
    {#if $actions.error}
      <span class='error' id='colors-json-error'>error!</span>
    {/if}
  {/if}
</form>
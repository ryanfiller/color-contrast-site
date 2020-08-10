<script context="module">
  import client from '../../sanityClient'
	export async function preload({ params, query }) {

    const owner = params.owner
    const sanityQuery = '*[_type == "palette" && owner._ref in *[_type=="owner" && name==$owner]._id ]'
    const sanityParams = { owner: owner }

    const palettes = await client().fetch(sanityQuery, sanityParams)
      .then(palettes => palettes)
      .catch(err => this.error(500, err))

    return {
      owner,
      palettes
    }
	}
</script>

<script>
  export let owner = ''
  export let palettes = []

  import { onMount } from 'svelte'
  import { actions, activeAction } from '../../stores.js'
  
  actions.set([
    {
      text: 'add a color palette',
      title: 'addPalette',
      icon: 'add',
      action: () => activeAction.set('addPalette')
    }
  ])
</script>

<svelte:head>
  <title>{owner} | color-contrast-table</title>
</svelte:head>

<style>
  span {
    display: block;
  }

  div {
    display: flex;
  }

  div span {
    flex: 1;
    height: 1rem;
  }
</style>

{#if !palettes.length}
	<p>uh oh, you have no color palettes. create one!</p>
{:else}
	<ul>
    {#each palettes as palette}
      <li>
        <a href='{owner}/{palette.title}'>
          <span>{palette.title}</span>
          <div>
            {#each palette.colors as color}
              <span style="background-color: {color.value}" />
            {/each}
          </div>
        </a>  
      </li>
    {/each}
  </ul>
{/if}

<script>
  import { url, params } from '@sveltech/routify'

  import client from '../../sanityClient'
  import { currentData, actions, activeAction } from '../../stores.js'
  import Layout from '../../layout.svelte'
  import Loading from '../../components/loading.svelte'

  const { owner } = $params

  const query = `
    *[_type == 'owner' && slug == $owner] {
      name,
      slug,
      _id,
      'palettes': *[_type == 'palette' && owner._ref == ^._id] {
        title,
        slug,
        colors
      }
    }
  `
  const queryArgs = { owner }
  const getData = async () => {
		return client.fetch(query, queryArgs)
		.then(response => {
      if (response === []) {
        Promise.reject
			} else {
        currentData.set({
          ...currentData,
          owner: { 
            name: response[0].name,
            slug: response[0].slug,
            id: response[0]._id
          },
          palettes: response[0].palettes
        })
      }
    }).catch(err => this.error(500, err))
	}
  
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

<Layout owner={$currentData.owner}>
	{#await getData()}
		<Loading />
	{:then}
		{#if $currentData.palettes.length}
			<ul>
				{#each $currentData.palettes as palette}
          <li>
            <a href={$url('/:owner/:palette', {
              owner: owner,
              palette: palette.slug
            })}>
              <span>{palette.title}</span>
              <div>
                {#if palette.colors?.length }
                  {#each palette.colors as color}
                    <span style="background-color: {color.value}" />
                  {/each}
                {/if }
              </div>
            </a>  
          </li>
        {/each}
			</ul>
		{:else}
			<p>uh oh, you have no color palettes. create one!</p>
		{/if}
	{:catch error}
		uh oh, no user with that name.
	{/await}
</Layout>
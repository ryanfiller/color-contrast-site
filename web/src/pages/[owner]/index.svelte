<script>
  import { url, params } from '@sveltech/routify'

  import client from '../../sanityClient'
  import { data, actions } from '../../stores.js'
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
        data.set({
          ...data,
          owner: { 
            name: response[0].name,
            slug: response[0].slug,
            id: response[0]._id
          },
          palettes: response[0].palettes.sort((a, b) =>  a.title.toLowerCase() > b.title.toLowerCase())
        })
      }
    }).catch(err => this.error(500, err))
  }
  
  actions.set({
		buttons: [
			{
        text: 'add a color palette',
        title: 'addPalette',
        icon: 'add',
        action: () => $actions.current = 'addPalette'
      }
		]
  })

  const promise = getData()
</script>

<svelte:head>
  <title>{owner} | colors.ryanfiller.com</title>
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

<Layout owner={$data.owner}>
	{#await promise}
		<Loading />
	{:then}
		{#if $data.palettes.length}
			<ul>
				{#each $data.palettes as palette}
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
			<p>uh oh, you have no color palettes. <button on:click={() => {$actions.current='addPalette'}}>create one!</button></p>
		{/if}
	{:catch error}
		uh oh, no user with that name.
	{/await}
</Layout>
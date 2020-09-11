<script>
  import { params } from '@sveltech/routify'

  import client from '../../sanityClient'
  import { currentData, actions, activeAction } from '../../stores.js'
  import Layout from '../../layout.svelte'
  import Loading from '../../components/loading.svelte'

  import Chart from 'color-contrast-table-svelte'

  const { owner, palette } = $params

  const query = `
    *[_type == 'owner' && slug == $owner] {
      name,
      slug,
      _id,
      'palettes': *[_type == 'palette' && owner._ref == ^._id && slug == $palette] {
        title,
        slug,
        _id,
        colors
      }
    }
  `

  const queryArgs = { owner, palette }
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
          palette: {
            title: response[0].palettes[0].title,
            slug: response[0].palettes[0].slug,
            id: response[0].palettes[0]._id
          },
          colors: response[0].palettes[0].colors
           ? response[0].palettes[0].colors.map(color => {
            return {
              name: color.name,
              value: color.value
            }
          })
          : []
        })
      }
    }).catch(err => this.error(500, err))
	}

		$: buttons = [
    {
      text: 'add a color',
      title: 'addColor', 
      icon: 'add',
      action: () => activeAction.set('addColor')
    },
    $activeAction === 'editColors'
      ? {
        text: 'save',
        icon: 'save',
        active: true,
        action: () => activeAction.set('')
      } 
      : {
        text: 'edit colors',
        title: 'editColors', 
        icon: 'edit',
        action: () => activeAction.set('editColors')
      },
    {
      text: 'see JSON',
      title: 'seeCode', 
      icon: 'code',
      action: () => activeAction.set('seeCode')
    }
    // {
    // 	text: 'download svg',
    //  title: 'downloadSvg', 
    // 	icon: 'download',
    // 	action: () => activeAction.set('downloadSvg')
    // }
  ]
    
  $: actions.set([...buttons])
  $: editting = $activeAction === 'editColors'
</script>

<svelte:head>
  <title>{palette} | color-contrast-table</title>
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

<Layout owner={$currentData.ownerData} palette={$currentData.paletteData}>
	{#await getData()}
		<Loading />
	{:then}
		{#if $currentData.colors.length}
      <Chart 
        useStyles
        editNames={editting}
        editValues={editting}
        colors={$currentData.colors}
      />
		{:else}
			<p>uh oh, this palette doesn't have any colors yet.</p>
		{/if}
	{:catch error}
		uh oh, no palette with that name.
	{/await}
</Layout>

<script>
  import { params } from '@sveltech/routify'

  import client from '../../sanityClient'
  import { data, actions } from '../../stores.js'
  import Layout from '../../layout.svelte'
  import Loading from '../../components/loading.svelte'
  import Palette from '../../components/palette.svelte'

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
        data.set({
          ...data,
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

  const getEditButton = editting => {
    if (editting) {
      return {
        text: 'save',
        icon: 'save',
        active: true,
        action: () => $actions.current = null
      }
    } else {
      return {
        text: 'edit colors',
        title: 'editColors', 
        icon: 'edit',
        action: () => $actions.current = 'editColors'
      }
    }
  }
    
  $: actions.set({
    buttons: [
      {
        text: 'add a color',
        title: 'addColor', 
        icon: 'add',
        action: () => $actions.current = 'addColor'
      },
      getEditButton($actions.current === 'editColors'),
      {
        text: 'see JSON',
        title: 'seeCode', 
        icon: 'code',
        action: () => $actions.current = 'seeCode'
      }
      // {
      // 	text: 'download svg',
      //  title: 'downloadSvg', 
      // 	icon: 'download',
      // 	action: () => $actions.current = 'downloadSvg'
      // }
    ],
    current: $actions.current,
  })
</script>

<!-- TODO make these use $data instead of params? -->

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

<Layout owner={$data.owner} palette={$data.palette}>
	{#await getData()}
		<Loading />
	{:then}
		{#if $data.colors.length}
      <Palette />
		{:else}
			<p>uh oh, this palette doesn't have any colors yet.</p>
		{/if}
	{:catch error}
		uh oh, no palette with that name.
	{/await}
</Layout>

<script context="module">
  import client from '../../sanityClient'
	export async function preload({ params, query }) {

    const { owner, palette: title } = params
    const sanityQuery = '*[_type == "palette" && owner._ref in *[_type=="owner" && name==$owner]._id && title == $title ][0]'
    const sanityParams = { owner, title }

    const colors = await client().fetch(sanityQuery, sanityParams)
      .then(palette => palette.colors.map(color => {
        return {
          name: color.name,
          value: color.value
        }
      }))
      .catch(err => this.error(500, err))

    return {
      owner,
      title,
      colors
    }
	}
</script>

<script>
  import { onMount } from 'svelte'
  import { actions } from '../../stores.js'
  import Chart from '../../components/chart.svelte'
  export let title = ''
  export let colors = []

  onMount(() => {
		actions.set([
			{
				text: 'add a color',
				icon: 'add',
				action: () => console.log('add a color')
      },
      {
				text: 'edit colors',
				icon: 'edit',
				action: () => console.log('edit colors')
      },
      {
				text: 'save',
				icon: 'save',
				action: () => console.log('save')
      },
      {
				text: 'see code',
				icon: 'code',
				action: () => console.log('see code')
      },
      // {
			// 	text: 'download svg',
			// 	icon: 'download',
			// 	action: () => console.log('download svg')
			// }
		])
	})
</script>

<svelte:head>
  <title>{title} | color-contrast-table</title>
</svelte:head>

<Chart colors={colors} />

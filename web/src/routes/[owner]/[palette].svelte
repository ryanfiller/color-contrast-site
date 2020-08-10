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
  import { actions, activeAction } from '../../stores.js'
  import Chart from '../../components/chart.svelte'
  export let title = ''
  export let colors = []

  let action
  activeAction.subscribe(currentAction => {
    action = currentAction
  })

		const buttons = [
    {
      text: 'add a color',
      title: 'addColor', 
      icon: 'add',
      action: () => activeAction.set('addColor')
    },
    {
      // fill this in in a second
    },
    {
      text: 'see JSON',
      title: 'seeCode', 
      icon: 'code',
      action: () => activeAction.set('seeCode')
    },
    // {
    // 	text: 'download svg',
    //  title: 'downloadSvg', 
    // 	icon: 'download',
    // 	action: () => activeAction.set('downloadSvg')
    // }
  ]

  $: if (action === 'editColors') {
    buttons[1] = {
      text: 'save',
      icon: 'save',
      active: true,
      action: () => activeAction.set('')
    }
  } else {
    buttons[1] = {
      text: 'edit colors',
      title: 'editColors', 
      icon: 'edit',
      action: () => activeAction.set('editColors')
    }
  }
    
  $: actions.set([...buttons])
</script>

<svelte:head>
  <title>{title} | color-contrast-table</title>
</svelte:head>

<Chart colors={colors} />

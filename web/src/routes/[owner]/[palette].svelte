<script context="module">
  import client from '../../sanityClient'
	export async function preload({ params, query }) {

    const { owner, palette: title } = params
    const sanityQuery = '*[_type == "palette" && owner._ref in *[_type=="owner" && name==$owner]._id && title == $title ][0]'
    const sanityParams = { owner, title }

    const colors = await client.fetch(sanityQuery, sanityParams)
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
  export let owner = ''
  export let title = ''
  export let colors = []

  import Chart from 'color-contrast-table-svelte'
</script>

<svelte:head>
  <title>{title} | color-contrast-table</title>
</svelte:head>

<span>{owner}</span>
<h1>{title}</h1>


<Chart 
  colors={colors}
  useStyles
/>

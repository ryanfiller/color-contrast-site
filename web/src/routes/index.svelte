<script>
	import { onMount, onDestroy } from 'svelte'
	import ColorTable from 'color-contrast-table-svelte'
	import sanityClient from '@sanity/client'

	// const client = sanityClient({
	// 	projectId: process.env.SANITY_ID,
	// 	dataset: 'production',
	// 	token: process.env.SANITY_TOKEN,
	// 	// useCdn: true // `false` if you want to ensure fresh data
	// })
	// const query = '*[_type == "ownser"]'
	// const params = {}

	// client.fetch(query, params).then(bikes => {
	// 	console.log('Bikes with more than one seat:')
	// 	bikes.forEach(bike => {
	// 		console.log(`${bike.name} (${bike.seats} seats)`)
	// 	})
	// })

	// let subscription
	// onMount(async () => {
	// 	subscription = client.listen(query, params)
	// 	.subscribe(update => {
	// 		const comment = update.result
	// 		console.log(`${comment.author} commented: ${comment.text}`)
	// 	})

	// 	// client.listen(query, params = {}, options = {includeResult: true})
	// })
	
	// onDestroy(() => subscription.unsubscribe())

	let colors = [
		{name: 'red', value: 'red'},
		{name: 'blue', value: 'blue'},
		{name: 'orange', value: 'orange'},
		{name: 'purple', value: 'purple'},
		{name: 'maroon', value: 'maroon'},
		{name: 'yellow', value: 'yellow'},
		{name: 'black', value: 'black'},
		{name: 'green', value: 'green'}
	]
	
</script>

<style>
	:global(body),
	:global(html) {
		margin: 0;
		padding: 0;
	}

	* {
		box-sizing: border-box;
	} 

	.app {
		height: 100vh;
		width: 100vw;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
</style>

<svelte:head>
	<title>Sapper project template</title>
</svelte:head>

<main class='app'>
	{#if !colors.length}
		<p>add some colors!</p>
	{:else}
		<ColorTable
			colors={colors}
			useStyles
		/>
	{/if}

	<!-- <div class='add-color'>
		<input type='text' placeholder='name your color' bind:value='{newColor.name}' />
		<input type='color' bind:value='{newColor.value}' />
		<button>
			Add Color
		</button>
	</div> -->
</main>

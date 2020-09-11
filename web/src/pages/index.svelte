<script>
	import { url } from '@sveltech/routify'
	import client from '../sanityClient'
	import { currentData, actions, activeAction } from '../stores.js'
	import Layout from '../layout.svelte'
	import Loading from '../components/loading.svelte'

	actions.set([
		{
			title: 'addUser',
			text: 'add a user',
			icon: 'add',
			action: () => activeAction.set('addUser')
		}
	])

	const query = '*[_type == "owner"]'
	const getData = async () => {
		return client.fetch(query)
		.then(response => currentData.set({
			...currentData,
			owners: response
		})
		).catch(err => this.error(500, err))
	}
</script>

<svelte:head>
	<title>color-contrast-table</title>
</svelte:head>

<Layout>
	{#await getData()}
		<Loading />
	{:then}
		{#if $currentData.owners.length}
			<ul>
				{#each $currentData.owners as owner}
					<li>
						<a href={$url('/:owner', {owner: owner.slug})}>
							<span>{owner.name}</span>
						</a>
					</li>	
				{/each}
			</ul>
		{:else}
			<p>uh oh, there are no users. create one!</p>
		{/if}
	{:catch error}
		error?
	{/await}
</Layout>

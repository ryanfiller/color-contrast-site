<script>
	import { url } from '@sveltech/routify'
	import client from '../sanityClient'
	import { actions, activeAction } from '../stores.js'
	import Layout from '../layout.svelte'
	import Loading from '../components/loading.svelte'

	let owners

	const getData = async () => {
		return client.fetch('*[_type == "owner"]')
		.then(response => {
			owners = response
		}).catch(err => this.error(500, err))
	}

	const data = getData()

	actions.set([
		{
			title: 'addUser',
			text: 'add a user',
			icon: 'add',
			action: () => activeAction.set('addUser')
		}
	])
</script>

<svelte:head>
	<title>color-contrast-table</title>
</svelte:head>

<Layout>
	{#await data}
		<Loading />
	{:then data}
		{#if owners && owners.length}
			<ul>
				{#each owners as owner}
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

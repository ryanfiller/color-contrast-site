<script>
	import { url } from '@sveltech/routify'
	import client from '../sanityClient'
	import { data, actions } from '../stores.js'
	import Layout from '../layout.svelte'
	import Loading from '../components/loading.svelte'

	actions.set({
		buttons: [
			{
				title: 'addUser',
				text: 'add a user',
				icon: 'add',
				action: () => $actions.current = 'addUser'
			}
		]
	})

	const query = '*[_type == "owner"]'
	const getData = async () => {
		return client.fetch(query)
		.then(response => data.set({
			...data,
			owners: response.sort((a, b) =>  a.name.toLowerCase() > b.name.toLowerCase())
		})
		).catch(err => this.error(500, err))
	}

	const promise = getData()
</script>

<svelte:head>
	<title>colors.ryanfiller.com</title>
</svelte:head>

<Layout>
	{#await promise}
		<Loading />
	{:then}
		{#if $data.owners.length}
			<ul>
				{#each $data.owners as owner}
					<li>
						<a href={$url('/:owner', {owner: owner.slug})}>
							<span>{owner.name}</span>
						</a>
					</li>	
				{/each}
			</ul>
		{:else}
			<p>uh oh, there are no users. <button on:click={() => {$actions.current='addUser'}}>create one!</button></p>
		{/if}
	{:catch error}
		error?
	{/await}
</Layout>

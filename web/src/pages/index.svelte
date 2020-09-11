<script>
	import { onMount } from 'svelte'
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

	onMount(() => getData())
</script>

<svelte:head>
	<title>colors.ryanfiller.com</title>
</svelte:head>

<Layout>
	{#await getData()}
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
			<p>uh oh, there are no users. create one!</p>
		{/if}
	{:catch error}
		error?
	{/await}
</Layout>

<script>
  import { Router, Link, Route } from 'svelte-routing'
  import Home from './home.svelte'
  import About from './routes/About.svelte'
  import Blog from './routes/Blog.svelte'

  export let url = ''
</script>

<Router url='{url}'>
  <!-- <nav>
    <Link to='/'>Home</Link>
    <Link to='about'>About</Link>
    <Link to='blog'>Blog</Link>
  </nav> -->
  <div>
    <Route path='/'><Home /></Route>
    <!-- <Route path='blog/:id' component='{BlogPost}' />
    <Route path='blog' component='{Blog}' />
    <Route path='about' component='{About}' /> -->
  </div>
</Router>

<!-- <script context="module">
  import client from '../sanityClient'
	export function preload({ params, query }) {
    return client.fetch('*[_type == "owner"]').then(owners => {
			return { owners }
		}).catch(err => this.error(500, err))
	}
</script>

<script>
	import { onMount } from 'svelte'
	import { actions, activeAction } from '../stores.js'

	export let owners = []

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


{#if !owners.length}
	<p>uh oh, there are no users. create one!</p>
{:else}
	<ul>
		{#each owners as owner}
			<li>
				<a href='/{owner.name}'>
					<span>{owner.name}</span>
				</a>
			</li>	
		{/each}
	</ul>
{/if} -->

<script>
	import Layout from '../layout.svelte'
</script>

<style>
	div {
		font-size: 5em;
		text-align: center;
		z-index: 1;
	}

	h1,
	p {
		margin: 0;
	}

	.video {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		overflow: hidden;
		z-index: 0;
	}

	video {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: auto;
		min-height: 100vh;
		height: auto;
		min-width: 100vw;
		opacity: .25;
	}
</style>

<svelte:head>
	<title>Ouch!</title>
</svelte:head>

<Layout>
	<div>
		<h1>404!</h1>
		<p>Uh oh, this page wasn't found...</p>
	</div>

	<div class="video">
		<video autoplay loop>
			<source src='/giphy.mp4' type='video/mp4'>
		</video> 
	</div>
</Layout>
<script context="module">
  import client from '../../sanityClient'
	export async function preload({ params, query }) {

    const owner = params.owner
    const sanityQuery = '*[_type == "palette" && owner._ref in *[_type=="owner" && name==$owner]._id ]'
    const sanityParams = { owner: owner }

    const palettes = await client.fetch(sanityQuery, sanityParams)
      .then(palettes => palettes)
      .catch(err => this.error(500, err))

    return {
      owner,
      palettes
    }
	}
</script>

<script>
  export let owner = ''
  export let palettes = []
</script>

<svelte:head>
  <title>{owner} | color-contrast-table</title>
</svelte:head>

<style>
  ul {
    list-style: none;
    padding: 0;
  }

  li + li {
    margin-top: 1rem;
  }

  a {
    text-decoration: none;
    display: block;
  }

  a:hover > span:after {
    content: ' »';
  }

  span {
    display: block;
    font-size: 1.5em;
  }

  div {
    display: flex;
  }

  div span {
    flex: 1;
    height: 2rem;
  }
</style>

<ul>
  {#each palettes as palette}
    <li>
      <a href='{owner}/{palette.title}'>
        <span>{palette.title}</span>
        <div>
          {#each palette.colors as color}
            <span style="background-color: {color.value}" />
          {/each}
        </div>
      </a>  
    </li>
  {/each}
</ul>

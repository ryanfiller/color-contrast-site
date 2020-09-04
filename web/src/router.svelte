<script>
  import { Router } from 'svelte-router-spa'

  import Owners from './routes/owners.svelte'
  import Palettes from './routes/palettes.svelte'
  import Error from './routes/error.svelte'

</script>
 
<Router routes={[
  {
    name: '/',
    component: Owners
  },
  {
    name: '404',
    path: '404',
    component: Error
  },
  { 
    name: '/:owner',
    component: Palettes
  }
]} />

<!-- <script>
  import { Router, Route, links } from 'svelte-routing'
  
  import Owners from './routes/owners.svelte'
  import Palettes from './routes/palettes.svelte'
  import Error from './routes/error.svelte'

  export let url
  let params
</script>

<div id='app' use:links>
  <Router url={url}>
      <Route path='/' component={Owners} />
      <Route path='/:owner'>
        <Palettes owner={params.owner} />
      </Route>
      <Route component={Error} />
  </Router>
</div> -->
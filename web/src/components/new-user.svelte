<script context="module">
  export async function preload(_page, session) {
    const { SANITY_TOKEN } = session
    return { token: SANITY_TOKEN }
  }
</script>


<script>
  import client from '../sanityClient'
  import { goto } from '@sapper/app'

  export let token

  let newUser = ''
  let newUserCreated = ''
  let error = ''

  const createNewUser = newUser => {
    const owner = {
      _type: 'owner',
      name: newUser
    }

    client().create(owner).then(response => {
      newUserCreated = response.name
      console.log(`new ownder created: ${response.name}, ${response._id}`)
    }).catch(response => {
      error = response.details.description
      console.log('error', error)
    })
  }

  const goToUser = async newUserCreated => {
    await goto(`/${newUserCreated}`)
  }

  const tryAgain = () => {
    newUser = ''
    newUserCreated = false
    error = ''
  }
</script>

<style>
	label {
		display: block;
	}

	label span {
		font-weight: bold;
	}

	input {
		width: 100%;
	}

	button {
		width: 100%;
	}

  code {
    display: block;
    width: 100%;
  }
</style>

{#if error}
  Uh oh.
  <code>{error}</code>
  <button on:click={tryAgain}>
    Try Again?
  </button>
{:else if newUserCreated}
  <button on:click={goToUser(newUserCreated)}>
    Go to User »
  </button>
  <button on:click={tryAgain}>
    Add Another?
  </button>
{:else}
  <label for='new user'>
    <span>add a new user</span>
    <input
      name='new user'
      id="new-user"
      placeholder="enter a unique name"
      bind:value={newUser}
    />
    </label>
  <button on:click={createNewUser(newUser)}>
    Add User
  </button>
{/if}
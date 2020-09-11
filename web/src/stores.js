import { writable } from 'svelte/store'

export const actions = writable({
  buttons: [],
  current: null
})

export const data = writable({
  // user: null, // TODO? - auth
  owners: [],
  owner: null,
  palettes: [],
  palette: null,
  colors: []
})
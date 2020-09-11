import { writable } from 'svelte/store'

export const actions = writable({
  buttons: [],
  current: null,
  error: false
})

export const data = writable({
  // user: null, // TODO? - auth
  // loading: false, // TODO?? - make buttons spin?
  owners: [],
  owner: null,
  palettes: [],
  palette: null,
  colors: []
})
import { writable } from 'svelte/store'

export const actions = writable([])
export const activeAction = writable('')
export const colorPalette = writable([])
export const currentData = writable({})
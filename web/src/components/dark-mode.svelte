<script>
  import { onMount, beforeUpdate } from 'svelte' 
  import Button from './button.svelte'

  let localStorage
  let darkMode
  let root

  const dark = '#212121'
  const light = '#efefef'
  
  const checkDarkMode = () => {
    return localStorage && localStorage.getItem('darkMode') === 'true' ? true : false
  }

  const toggleDarkMode = () => {
    localStorage &&localStorage.setItem('darkMode', !darkMode)
    darkMode = checkDarkMode()
  }
  
  const setDarkModeCSS = (darkMode) => {
    if (!!darkMode) {
      root.style.setProperty('--textColor', light);
      root.style.setProperty('--backgroundColor', dark);
    } else {
      root.style.setProperty('--textColor', dark);
      root.style.setProperty('--backgroundColor', light);
    }
  }
  
  beforeUpdate(() => {
    localStorage = window.localStorage
    darkMode = checkDarkMode()
    root = document.documentElement
  })

  $: checkDarkMode()
  $: root && setDarkModeCSS(darkMode)
  $: icon = !!darkMode ? 'moon' : 'sun'
</script>

<Button
  title='toggle dark mode'
  icon={icon}
  action={toggleDarkMode}
/>
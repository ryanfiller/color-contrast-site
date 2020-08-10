<script>
  import { onMount, beforeUpdate } from 'svelte' 
  import Button from './button.svelte'

  import Sun from '../../static/icons/sun.svg'
  import Moon from '../../static/icons/moon.svg'

  let localStorage
  let darkMode
  let root

  const dark = '#212121'
  const light = '#ffffff'
  
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
</script>

<Button
  title='toggle dark mode'
  action={toggleDarkMode}
>
  <svelte:component this={!!darkMode ? Moon : Sun}/>
</Button>
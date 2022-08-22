import { refreshPage } from '../js/create_page.js'

// первичная отрисовка
window.addEventListener('hashchange', refreshPage)
refreshPage()
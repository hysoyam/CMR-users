export { createPage, refreshPage }

import { headers } from './storage.js'
import { createClientPage } from './client_page.js'
import { createSearchBlock } from './search.js'
import { createTable, fillTable } from './table.js'
import { getClient, getListOfClients } from './client_server.js'

function createHeader() {

  let headerBlock = document.createElement('div')
  headerBlock.classList.add('header_block')

  let logo = document.createElement('div')
  logo.classList.add('header_block__logo')

  let logoHeader = document.createElement('h1')
  logoHeader.classList.add('header_block__main_header')
  logoHeader.innerHTML = 'skb.'

  let searchBlock = createSearchBlock()

  logo.append(logoHeader)
  headerBlock.append(logo)
  headerBlock.append(searchBlock)

  return headerBlock
}

async function createPage(content = null, clients = []) {

  document.body.innerHTML = ''

  let pageHeader = document.createElement('header')
  let pageMain = document.createElement('main')
  pageMain.id = 'main'

  pageHeader.append(createHeader())
  document.body.append(pageHeader)

  if (content) {
    pageMain.append(await content)
    document.body.append(pageMain)

  } else {

    pageMain.append(createTable(headers))
    document.body.append(pageMain)

    clients.length ? fillTable(clients) : fillTable(getListOfClients())
  }
}

async function refreshPage() {

  if (location.hash.length) {

    let res = await getClient(location.hash.slice(1))

    if (res.ok) {

      let client = await res.json()
      createPage(createClientPage(client))

    } else {
      createPage()
    }
  }
  else {
    createPage()
  }
}
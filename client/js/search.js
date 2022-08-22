export {createSearchBlock, searchClient}

import { getClients } from '../js/client_server.js'
import { refreshTable, } from '../js/table.js'
import {  createPage } from '../js/create_page.js'

let globalIndex = 0
let globalSearchQuery = ''
let globalCurrentEl = null

function createSearchBlock() {

  let searchBlock = document.createElement('form')
  searchBlock.classList.add('header_block__search__block')
  searchBlock.id = 'search-block'

  searchBlock.addEventListener('submit', (e) => {
    e.preventDefault()
  })

  let searchInput = document.createElement('input')
  searchInput.classList.add('header_block__search', 'input__text')
  searchInput.placeholder = 'Введите запрос'
  searchInput.id = 'search-input'
  searchInput.autocomplete = 'off'

  let timeoutID
  searchInput.addEventListener('input', (e) => {
    clearTimeout(timeoutID)
    timeoutID = setTimeout(() => searchClient(e), 300)
  })

  searchBlock.append(searchInput)

  return searchBlock
}

function navigateTooltip(event) {

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault()
      navigate(1)
      break

    case "ArrowUp":
      event.preventDefault()
      navigate(-1)
      break

    default:
      break
  }
}

function navigate(index) {

  let list = document.getElementById('search_tooltip_id')
  let searchField = document.getElementById('search-input')

  if (list) {

    // если меньше длинны то фокус на ввод
    if (globalIndex + index <= 0) {

      list.children[globalIndex - 1]?.classList.remove('search_tooltip__link__active')

      searchField.focus()
      globalIndex = 0
      globalCurrentEl = null

      // если больше длинны то стоит на месте
    } else if (globalIndex + index <= list.children.length) {

      globalIndex = globalIndex + index
      let currentElement = list.children[globalIndex - 1]

      currentElement?.nextSibling?.classList.remove('search_tooltip__link__active')
      currentElement?.previousSibling?.classList.remove('search_tooltip__link__active')

      currentElement.classList.add('search_tooltip__link__active')

      globalCurrentEl = currentElement
    }
  }
}

async function searchClient(event) {

  if (event.target.value.trim()) {

    globalSearchQuery = event.target.value
    let response = await getClients(globalSearchQuery)

    if (response.ok) {

      let listOfclients = await response.json()
      createSearchTooltip(listOfclients)
    }
  } else {
    removeSearchTooltip()
    globalIndex = 0
  }

}

function removeSearchTooltip(event = null) {

  if (event) {
    if (!event.path.includes(document.getElementById('search-block'))) {

      document.removeEventListener('mousedown', removeSearchTooltip)
      document.getElementById('search_tooltip_id')?.remove()
    }

  } else {

    document.getElementById('search_tooltip_id')?.remove()
  }
}

function createSearchTooltip(listOfclients) {
  removeSearchTooltip()

  globalIndex = null
  globalCurrentEl = null

  document.addEventListener('mousedown', removeSearchTooltip)

  const searchBlock = document.getElementById('search-block')
  const searchField = document.getElementById('search-input')
  const searchTooltip = document.createElement('ul')

  searchTooltip.classList.add('search_tooltip')
  searchTooltip.id = 'search_tooltip_id'

  // навигация
  // если есть хоть один клиент то делаем список
  if (listOfclients.length > 0) {

    // поиск по нажатию Еnter
    searchField.addEventListener('keydown', (e) => {
      if (e.key == 'Enter' && !globalCurrentEl) {

        removeSearchTooltip()
        refreshTable(searchField.value)
      } else if (e.key == 'Enter' && globalCurrentEl) {

        globalCurrentEl.click()
      }
    })

    // навигация по  выпадающему списку
    searchField.addEventListener('keydown', navigateTooltip)

    // добавление списка клиентов в виде ссылок 
    let dropdownList = []
    let tempClients = [...listOfclients]

    const partOfNameMatches = [
      {
        amount: 0,
        type: 'name',
        text: '',
        clients: []
      },
      {
        amount: 0,
        type: 'surname', // фамилия
        text: '',
        clients: []
      },
      {
        amount: 0,
        type: 'lastName', // отчество
        text: '',
        clients: []
      },
    ]

    // добавление совпадений по части имени в выпадающий список
    partOfNameMatches.forEach(getMatchesInPartOfName)

    function getMatchesInPartOfName(obj) {
      for (const client of tempClients) {

        const reg = new RegExp(`^${globalSearchQuery}`, 'i')
        const clientName = client[obj.type]

        if (reg.test(clientName)) {

          // если первое совпадение
          if (!obj.text) {
            obj.amount++
            obj.text = clientName
            obj.clients.push(client)
            // если не первое совпадение
          } else if (obj.text === clientName) {
            obj.amount++
            obj.clients.push(client)
            // если новое имя - создаем новый обьект
          } else {
            // новое имя
            // еслти с таким именем уже есть - пропускаем
            if (!partOfNameMatches.find(el => el.text === clientName)) {

              const newObj = {
                amount: 0,
                type: obj.type,
                text: clientName,
                clients: []
              }

              // наполнение обьекта
              for (const client of tempClients) {
                if (newObj.text === client[newObj.type]) {
                  newObj.amount++
                  newObj.clients.push(client)
                }
              }
              // прикрепление обьекта
              partOfNameMatches.push(newObj)
            }
          }
        }
      }
    }

    // вывод всех простых совпадений в список
    dropdownList.push(...tempClients)

    // dropdownList сформирован и готов к отрисовке
    // отрисовка всех сложных ссылок
    for (const clients of partOfNameMatches) {
      if (clients.amount > 1) {

        let searchItem = document.createElement('li')
        searchItem.classList.add('search_tooltip__item', 'search_tooltip__item_group')

        let nameLink = document.createElement('a')
        nameLink.classList.add('search_tooltip__link', 'link')

        // TODO
        // формат окончаний я/е/й
        let ending = 'совпадений'

        nameLink.innerText = `${clients.text} - ${clients.amount} ${ending}`

        searchItem.addEventListener('click', () => {
          //  очистка инпута  и закрытие тултипа
          searchField.value = ''
          removeSearchTooltip()

          createPage(null, clients.clients)
        })

        nameLink.addEventListener('keydown', (e) => {
          // нужно рисовать по списку
          if (e.key == 'Enter') refreshTable(null, clients.clients)
        })

        searchItem.append(nameLink)
        searchTooltip.append(searchItem)
      }
    }
    // отрисовкa списка элементов по списку
    for (const client of dropdownList) {

      // если строка поиска содержится в имени то добавляем клиентa
      let searchItem = document.createElement('li')
      searchItem.classList.add('search_tooltip__item')

      let nameLink = document.createElement('a')
      nameLink.classList.add('search_tooltip__link', 'link')

      nameLink.innerText = client.surname + ' ' + client.name + ' ' + client.lastName

      searchItem.addEventListener('click', () => {
        // очистка инпута  и закрытие тултипа
        searchField.value = ''
        removeSearchTooltip()

        if (document.getElementById(client.id)) {
          // подсвечиваю клиента и перематываю до клиента
          focusOnClient(client.id)
        } else {
          location.hash = client.id
        }
      })

      searchItem.append(nameLink)
      searchTooltip.append(searchItem)
    }

  } else {

    searchField.removeEventListener('keydown', navigateTooltip)

    let notFoundItem = document.createElement('li')
    notFoundItem.classList.add('search_tooltip__item__not_found')
    notFoundItem.innerHTML = 'По данному имени ничего не нашлось...'

    searchTooltip.append(notFoundItem)
  }

  searchBlock.append(searchTooltip)
}

function focusOnClient(id) {

  const activeClass = 'table__row_active'

  const currentClient = document.getElementById(id)
  const previusClient = Array.from(document.getElementsByClassName(activeClass))

  previusClient?.forEach(el => el.classList.remove(activeClass))

  currentClient?.classList.add(activeClass)

  currentClient.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  })

  document.addEventListener('mousedown', e => currentClient.classList.remove(activeClass))
} 
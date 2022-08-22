export { createTable, fillTable, refreshTable, createTooltipContact }

import { SVG } from './storage.js'
import { getListOfClients } from './client_server.js'
import { createClientModalWindow, createDeleteClientModalWindow } from './modal.js'


function createTable(headers) {
    
    const tableId = 'clients'
    let tableBlock = document.createElement('div')
    let header = document.createElement('h1')
    let table = document.createElement('table')
    let tableHeaders = createTableHeaders(headers)
    let tableBody = document.createElement('tbody')

    header.innerText = 'Клиенты'

    tableBlock.classList.add('table__block')
    header.classList.add('header', 'table_header')
    tableBody.classList.add('table_body')

    // прикрепление элементов к блоку
    table.id = tableId
    table.append(tableHeaders, tableBody)

    tableBlock.append(header)
    tableBlock.append(table)

    return tableBlock

    function createTableHeaders(headers) {

        let tableHeadBlock = document.createElement('thead')
        tableHeadBlock.classList.add('table_head')
        let tableHeadersRow = document.createElement('tr')
        tableHeadBlock.append(tableHeadersRow)

        tableHeadBlock.id = 'tableHeaders'

        for (let header of headers) {

            let headerCell = document.createElement('th')
            let headerContainer = document.createElement('div')

            let headerText = document.createElement('p')
            let headerAfter = document.createElement('span')
            headerContainer.append(headerText, headerAfter)
            headerCell.append(headerContainer)

            if (header.sortTextDesc) {
                let headerSortText = document.createElement('p')
                headerSortText.innerText = header.sortTextDesc
                headerSortText.classList.add('sort_description')
                headerContainer.append(headerSortText)
            }

            headerContainer.classList.add('table_head__cell')

            headerText.innerText = header.name

            // Если сортируется то вставляем сортировку с переключением по возр и убыв
            // проверка на нужность сортировки
            if (header.sortable) {

                headerCell.dataset.sm = header.id

                // добавление стрелочек сортировки ::after
                // если порядок по
                if (header.startOrder) {
                    headerCell.dataset.order = 'asc'
                    headerCell.dataset.currentOrder = '1'

                    headerCell.addEventListener('click', sortDESC)

                    headerAfter.innerHTML = SVG.arrowDown
                } else {
                    headerCell.dataset.order = 'desc'
                    headerCell.addEventListener('click', sortASC)

                    headerAfter.innerHTML = SVG.arrowUp
                }
            }

            tableHeadersRow.append(headerCell)
        }

        function sortASC(e) {

            e.currentTarget.dataset.order = 'asc'

            for (const child of e.currentTarget.parentElement.children) {
                child.dataset.currentOrder = '0'
            }
            e.currentTarget.dataset.currentOrder = '1'
            sortTable(headers[e.currentTarget.dataset.sm].sort, true)
            e.currentTarget.removeEventListener('click', sortASC)
            e.currentTarget.addEventListener('click', sortDESC)
            e.currentTarget.children[0].children[1].innerHTML = SVG.arrowDown

            if (e.currentTarget.children[0].children[2]) {
                e.currentTarget.children[0].children[2].innerHTML = headers[e.currentTarget.dataset.sm].sortTextDesc
            }
        }

        function sortDESC(e) {

            e.currentTarget.dataset.order = 'desc'

            for (const child of e.currentTarget.parentElement.children) {
                child.dataset.currentOrder = '0'
            }
            e.currentTarget.dataset.currentOrder = '1'
            sortTable(headers[e.currentTarget.dataset.sm].sort, false)
            e.currentTarget.removeEventListener('click', sortDESC)
            e.currentTarget.addEventListener('click', sortASC)
            e.currentTarget.children[0].children[1].innerHTML = SVG.arrowUp

            if (e.currentTarget.children[0].children[2]) {
                e.currentTarget.children[0].children[2].innerHTML = headers[e.currentTarget.dataset.sm].sortTextAsc
            }
        }

        return tableHeadBlock
    }
}

async function fillTable(clients, sortMethod = null, order = true) {


    let tableBody = document.querySelector(`#${tableId} tbody`)
    // очистка таблицы перед заполнением
    tableBody.innerHTML = ''

    // показ плашки загрузки 
    // удаление отображения кнопки добавления клиента
    document.getElementById('add_client_btn')?.remove()
    document.getElementById('load__indicator')?.remove()
    tableBody.append(createLoadIndicator())

    clients = await clients // неправильно что в функции дожидаюсь
    // // сортировка если надо
    if (sortMethod) {
        clients.sort(sortMethod)
        // Порядок сортировки
        if (!order) clients.reverse()
    }
    //прикрепление к таблице
    for (const client of clients) {
        tableBody.append(createClientRow(client))
    }

    // удаление индикации загрузки  
    document.getElementById('load__indicator')?.remove()

    // показ кнопки добавления клиента
    document.getElementById('main').append(createAddClientBtn())
}

async function refreshTable(filter = null, clients = null) {
    clients = await clients
    clients ? clients : clients = await getListOfClients(filter)

    fillTable(clients, null, true)
}

function sortTable(sortFunction, order) {
    fillTable(getListOfClients(), sortFunction, order)
}

function createTooltipContact(text, item) {
    let tooltip = document.createElement('div')
    tooltip.classList.add('contact_tooltip', 'tooltip')
    tooltip.innerText = text

    item.style = 'position: relative'

    tooltip.removeTooltip = function () {
        tooltip.remove()
    }

    tooltip.appendTooltip = function () {
        item.append(tooltip)
    }

    item.addEventListener('mouseover', tooltip.appendTooltip)
    item.addEventListener('mouseout', tooltip.removeTooltip)

    return tooltip
}

function createAddClientBtn() {
    let block = document.createElement('div')
    block.id = 'add_client_btn'

    let btn = document.createElement('button')
    btn.classList.add('btn', 'btn__secondary', 'button__add_client')
    btn.innerText = 'Добавить клиента'
    
    btn.addEventListener('click', () => {
        createClientModalWindow()
    })

    let icon = document.createElement('span')
    icon.innerHTML = SVG.addClientIcon

    btn.prepend(icon)

    block.append(btn)
    return block
}

function createLoadIndicator() {
    let container = document.createElement('div')
    container.id = 'load__indicator'
    container.classList.add('loadIndicator__container')
    container.innerHTML = SVG.loadIndicatorBig

    return container
}



function createClientRow(client) {

    let clientRow = document.createElement('tr')

    let id = document.createElement('td')
    let fullname = document.createElement('td')

    let creationDate = document.createElement('td')
    let creationDateDate = document.createElement('p')
    let creationDateTime = document.createElement('p')

    let changeDate = document.createElement('td')
    let changeDateDate = document.createElement('p')
    let changeDateTime = document.createElement('p')

    let contactsField = document.createElement('td')

    id.innerText = client.id

    fullname.innerHTML = `<a href ="#${client.id}">${client.surname} ${client.name} ${client.lastName}<a/>`

    clientRow.classList.add('table__row')

    id.classList.add('td__id')

    let creationDateWrapper = document.createElement('div')
    let changeDateWrapper = document.createElement('div')

    creationDateWrapper.classList.add('td__date')
    changeDateWrapper.classList.add('td__date')

    fullname.classList.add('td__fullname')

    let contactsFieldContainer = document.createElement('div')
    contactsField.append(contactsFieldContainer)
    contactsFieldContainer.classList.add('td__contacts')


    let actions = document.createElement('td')
    let actionsFieldContainer = document.createElement('div')
    actions.append(actionsFieldContainer)

    actionsFieldContainer.classList.add('td__actions')

    creationDateDate.classList.add('td__date_date')
    changeDateDate.classList.add('td__date_date')
    creationDateTime.classList.add('td__date_time')
    changeDateTime.classList.add('td__date_time')

    function formatDate(number) {
        // 11.01.2021
        // 12:45
        return number < 10 ? number = '0' + number : number
    }

    const CREATED_AT = new Date(client.createdAt)
    const UPDATED_AT = new Date(client.updatedAt)

    creationDateDate.innerText = formatDate(CREATED_AT.getDate()) + '.' + formatDate((CREATED_AT.getMonth() + 1)) + '.' + CREATED_AT.getUTCFullYear()
    creationDateTime.innerText = formatDate(CREATED_AT.getHours()) + ':' + formatDate(CREATED_AT.getMinutes())

    changeDateDate.innerText = formatDate(UPDATED_AT.getDate()) + '.' + formatDate((UPDATED_AT.getMonth() + 1)) + '.' + UPDATED_AT.getUTCFullYear()
    changeDateTime.innerText = formatDate(UPDATED_AT.getHours()) + ':' + formatDate(UPDATED_AT.getMinutes())

    for (const contact of client.contacts) {
        let contactIcon = document.createElement('div')
        contactIcon.classList.add('contact_icon')

        switch (contact.type) {
            case 'phone':
                contactIcon.innerHTML = SVG.phoneIcon
                contact.type = 'Телефон'
                break

            case 'Vk':
                contactIcon.innerHTML = SVG.vkIcon
                contact.type = 'Вконтакте'
                break

            case 'Facebook':
                contactIcon.innerHTML = SVG.fbIcon
                contact.type = 'Facebook'
                break

            case 'Email':
                contactIcon.innerHTML = SVG.emailIcon
                contact.type = 'E-mail'
                break

            default:
                contactIcon.innerHTML = SVG.otherIcon
                contact.type = 'Доп. контакт'
                break
        }

        let tooltip = createTooltipContact(contact.type + ": " + contact.value, contactIcon)

        contactIcon.addEventListener('click', copyToBuffer)

        function copyToBuffer() {
            navigator.clipboard.writeText(contact.value)
            showCopyPop(contact.type)

            function showCopyPop(type) {

                let msg = type + ' скопирован'
                let oldText = tooltip.innerText

                tooltip.innerText = msg
                tooltip.appendTooltip()
                contactIcon.removeEventListener('mouseout', tooltip.removeTooltip)

                setTimeout(() => {
                    tooltip.removeTooltip()
                    contactIcon.addEventListener('mouseout', tooltip.removeTooltip)
                    tooltip.innerText = oldText
                }, 1000)
            }
        }

        contactsFieldContainer.append(contactIcon)
    }

    clientRow.id = client.id

    actionsFieldContainer.append(...createActions(client))

    creationDateWrapper.append(creationDateDate)
    creationDateWrapper.append(creationDateTime)
    creationDate.append(creationDateWrapper)

    changeDateWrapper.append(changeDateDate)
    changeDateWrapper.append(changeDateTime)

    changeDate.append(changeDateWrapper)


    clientRow.append(id)
    clientRow.append(fullname)
    clientRow.append(creationDate)
    clientRow.append(changeDate)
    clientRow.append(contactsField)
    clientRow.append(actions)

    return clientRow

    function createActions(client) {

        let editBtn = document.createElement('button')
        let editBtnContainer = document.createElement('div')
        let editBtnIcon = document.createElement('span')

        let deleteBtn = document.createElement('button')
        let deleteBtnContainer = document.createElement('div')
        let deleteBtnIcon = document.createElement('span')

        editBtnIcon.innerHTML = SVG.editIcon
        deleteBtnIcon.innerHTML = SVG.deleteIcon

        editBtnIcon.classList.add('actions-wrapper-icon')
        editBtnContainer.classList.add('actions-wrapper')
        deleteBtnContainer.classList.add('actions-wrapper')

        editBtnContainer.append(editBtnIcon, editBtn)
        deleteBtnContainer.append(deleteBtnIcon, deleteBtn)

        editBtn.classList.add('btn__only_text', 'btn__only_text__edit')
        deleteBtn.classList.add('btn__only_text', 'btn__only_text__delete')

        editBtn.innerText = 'Изменить'
        deleteBtn.innerText = 'Удалить'


        // У каждого из модальных окон должно быть поле для вставки контактов?
        editBtnContainer.addEventListener('click', (e) => {

            createClientModalWindow(client.id, e)

        })

        deleteBtnContainer.addEventListener('click', () => {

            createDeleteClientModalWindow(client.id)

        })

        return [editBtnContainer, deleteBtnContainer]
    }
}
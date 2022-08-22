export { createClientModalWindow, createDeleteClientModalWindow }


import { SVG } from './storage.js'
import { refreshTable, createTooltipContact } from './table.js'
import { addClient, updateClient, deleteClient, getClient } from './client_server.js'


const contactLimit = 10

async function createClientModalWindow(id = null, event = null) {

  let modalwindow = document.createElement('div')

  let header = document.createElement('h2')
  header.classList.add('header', 'block__header', 'modal__header')

  let headerBlock = document.createElement('div')
  headerBlock.classList.add('modal__block', 'modal__header_block')
  headerBlock.append(header)

  let modalFormBlock = document.createElement('form')
  modalFormBlock.classList.add('form', 'modal__block', 'modal__form')

  let firstnameLabel = document.createElement('label')
  firstnameLabel.classList.add('label', 'modal__lable')
  firstnameLabel.innerText = 'Имя*'
  firstnameLabel.setAttribute('for', 'name-input')

  let firstnameInput = document.createElement('input')
  firstnameInput.classList.add('input', 'modal__input')
  firstnameInput.id = 'name-input'

  let surnameLabel = document.createElement('label')
  surnameLabel.classList.add('label', 'modal__lable')
  surnameLabel.innerText = 'Фамилия*'
  surnameLabel.setAttribute('for', 'surname-input')

  let surnameInput = document.createElement('input')
  surnameInput.classList.add('input', 'modal__input')
  surnameInput.id = 'surname-input'

  let midNameLabel = document.createElement('label')
  midNameLabel.classList.add('label', 'modal__lable')
  midNameLabel.innerText = 'Отчество'
  midNameLabel.setAttribute('for', 'midname-input')

  let midNameInput = document.createElement('input')
  midNameInput.classList.add('input', 'modal__input')
  midNameInput.id = 'midname-input'

  let buttonsBlock = document.createElement('div')
  buttonsBlock.classList.add('modal__block', 'modal__buttons')
  buttonsBlock.id = 'modal__buttons'

  let contactsList = document.createElement('div')
  contactsList.classList.add('modal__contacts_container')
  contactsList.id = 'modal-contacts-input'

  function createCustomPlaceholder(element, innerHTML) {
    let placeholder = document.createElement('div')
    placeholder.classList.add('input__placeholder')
    placeholder.innerHTML = innerHTML

    element.addEventListener('input', () => {
      placeholder.classList.toggle('hidden', element.value)
    })

    let wrapper = document.createElement('div')
    wrapper.style = 'position: relative'

    element.parentNode.insertBefore(wrapper, element)

    wrapper.append(element)
    wrapper.append(placeholder)
  }

  // блок списка контактов 
  let contactsBlock = document.createElement('div')
  contactsBlock.classList.add('modal__block', 'modal__contacts_block', 'modal__contacts_block__empty')

  // блок добавления контактов 
  let addContactIcon = document.createElement('span')
  addContactIcon.classList.add('centered')
  addContactIcon.innerHTML = SVG.addContactIcon

  let addContactBtn = document.createElement('button')
  addContactBtn.classList.add('btn__only_text')
  addContactBtn.innerText = 'Добавить контакт'
  addContactBtn.addEventListener('click', addContactInput)

  let addContactBtnContainer = document.createElement('div')
  addContactBtnContainer.classList.add('btn__container')
  addContactBtnContainer.id = 'add_contact_btn'

  addContactBtnContainer.append(addContactIcon, addContactBtn)

  modalFormBlock.append(surnameLabel, surnameInput, firstnameLabel, firstnameInput, midNameLabel, midNameInput)
  contactsBlock.append(contactsList, addContactBtnContainer)

  modalwindow.append(headerBlock, modalFormBlock, contactsBlock, buttonsBlock)

  surnameInput.addEventListener('input', capitalizeFirstLetter)
  firstnameInput.addEventListener('input', capitalizeFirstLetter)
  midNameInput.addEventListener('input', capitalizeFirstLetter)

  if (id) {

    let infoID = document.createElement('p')
    infoID.classList.add('modal__header_block_infoID', 'text__light')
    infoID.innerText = `ID: ${id}`
    header.innerText = 'Изменить данные'

    headerBlock.append(infoID)

    const currentTarget = event.currentTarget
    currentTarget.children[0].style.display = 'none'

    currentTarget.children[1].disabled = true
    currentTarget.prepend(LoadIndicatorOnBtn())

    let response = await getClient(id)
    let client = await response.json()

    // удаление загрузки на кнопке
    document.getElementById('load__indicator').remove()
    currentTarget.children[0].style.display = 'block'
    currentTarget.children[1].disabled = false


    // Значения если не менялись поля
    firstnameInput.value = client.name
    surnameInput.value = client.surname
    midNameInput.value = client.lastName

    firstnameInput.placeholder = client.name
    surnameInput.placeholder = client.surname
    midNameInput.placeholder = client.lastName

    // заполнение контактов 
    for (let contact of client.contacts) {
      addContactInput(contact.type, contact.value, contactsList)
    }

    // кновка сохранрения нового клиента 
    let saveContactBtn = document.createElement('button')
    saveContactBtn.classList.add('btn', 'btn__primary', 'btn__primary__mb5')
    saveContactBtn.innerText = 'Сохранить'
    saveContactBtn.addEventListener('click', saveChangesHandler)
    buttonsBlock.append(saveContactBtn)

    // кновка удаления клиента
    let deteteClientBtn = document.createElement('button')
    deteteClientBtn.classList.add('btn__only_text', 'btn__link')
    deteteClientBtn.innerText = 'Удалить клиента'
    buttonsBlock.append(deteteClientBtn)
    deteteClientBtn.addEventListener('click', deleteClientHandler)

  } else {

    header.innerText = 'Новый клиент'

    // скрытите лейблов до первого ввода
    firstnameLabel.classList.add('hidden')
    surnameLabel.classList.add('hidden')
    midNameLabel.classList.add('hidden')

    surnameInput.addEventListener('input', hideLableById)
    firstnameInput.addEventListener('input', hideLableById)
    midNameInput.addEventListener('input', hideLableById)

    // добавление плейсхолдеров
    createCustomPlaceholder(surnameInput, 'Фамилия<span class="text__marked">*</span>')
    createCustomPlaceholder(firstnameInput, 'Имя<span class="text__marked">*</span>')
    createCustomPlaceholder(midNameInput, 'Отчество')

    // кновка создания нового клиента 
    let add_client_btn = document.createElement('button')
    add_client_btn.classList.add('btn', 'btn__primary', 'btn__primary__mb5')
    add_client_btn.innerText = 'Сохранить'
    add_client_btn.addEventListener('click', saveNewClient)
    buttonsBlock.append(add_client_btn)

    // кновка закрытия окна
    let closeModalBtn = document.createElement('button')
    closeModalBtn.classList.add('btn__only_text', 'btn__link')
    closeModalBtn.innerText = 'Отмена'
    closeModalBtn.addEventListener('click', closeModal)
    buttonsBlock.append(closeModalBtn)
  }

  document.body.append(createModalWindow(modalwindow))
  checkContactsLimit(contactLimit)

  function disableInputs() {
    let layer = document.createElement('div')
    layer.classList.add('madal__all_inputs_disable')
    layer.id = 'inputs_disable'
    return layer
  }

  function capitalizeFirstLetter(e) {
    let input = e.target.value
    e.target.value = input.slice(0, 1).toUpperCase() + input.slice(1)
  }

  function hideLableById(e) {
    let id = e.target.id
    let label = document.querySelector("label[for='" + id + "']")

    if (e.target.value) {
      label.classList.remove('hidden')
    } else {
      label.classList.add('hidden')
    }
  }

  async function saveNewClient(event) {
    event.target.removeEventListener('click', saveNewClient)
    event.target.prepend(LoadIndicatorOnBtn())
    event.target.disabled = true

    //  вывести поверх формы абсолютно
    // позиционированный полупрозрачный слой.
    modalFormBlock.append(disableInputs())
    contactsBlock.append(disableInputs())

    if (validateClient()) {

      let response = await addClient(getClientFromTable())
      if (response.ok) {
        refreshTable()
        closeModal()
      } else {
        event.target.disabled = false

        event.target.addEventListener('click', saveNewClient)
        createErrorBlock(await response.json(), response.status)
      }
    } else {
      event.target.disabled = false
      event.target.addEventListener('click', saveNewClient)
    }
  }

  function validateClient() {
    let client = getClientFromTable()
    let errors = []

    if (!client.name) { errors.push({ field: 'name', message: 'Не указано имя' }) }
    if (!client.surname) { errors.push({ field: 'surname', message: 'Не указана фамилия' }) }


    // TODO не работает проверка на неполный ввод поля контактов
    for (const contact of client.contacts) {

      if (!contact.type || !contact.value) {

        errors.push({ field: 'modal-contacts', message: 'Не все добавленные контакты полностью заполнены' })
        break
      }
    }

    if (errors.length) {

      createErrorBlock({ errors: errors, local: true })
      return false

    } else {
      return true
    }
  }

  async function saveChangesHandler(event) {

    modalFormBlock.append(disableInputs())
    contactsBlock.append(disableInputs())

    event.target.disabled = true

    event.target.removeEventListener('click', saveChangesHandler)

    if (validateClient()) {
      event.target.prepend(LoadIndicatorOnBtn())

      let response = await updateClient(id, getClientFromTable())

      if (response.ok) {
        refreshTable()
        closeModal()

      } else {
        event.target.disabled = false
        event.target.addEventListener('click', saveChangesHandler)
        createErrorBlock(await response.json(), response.status)
      }

    } else {
      event.target.disabled = false
      event.target.addEventListener('click', saveChangesHandler)
    }
  }

  async function deleteClientHandler(event) {

    modalFormBlock.append(disableInputs())
    contactsBlock.append(disableInputs())

    event.target.disabled = true

    event.target.removeEventListener('click', deleteClientHandler)

    let response = await deleteClient(id)

    if (response.ok) {
      refreshTable()
      closeModal()

    } else {
      event.target.disabled = false
      event.target.addEventListener('click', deleteClientHandler)
      createErrorBlock(await response.json(), response.status)
    }
  }

  function getClientFromTable() {
    return {
      name: document.getElementById('name-input').value,
      surname: document.getElementById('surname-input').value,
      lastName: document.getElementById('midname-input').value,
      contacts: getContacts(),
    }
  }

  function getContacts() {

    const forms = document.forms
    const contacts = []

    for (const form of forms) {

      if (form.id === 'contact-set') {

        contacts.push({
          type: form.contactTypeInput.value,
          value: form.contactValueInput.value,
        })
      }
    }

    return contacts
  }
}

function createDeleteClientModalWindow(id) {

  let modalwindow = document.createElement('div')
  modalwindow.classList.add('modal__delete')

  let header = document.createElement('h2')
  header.classList.add('header', 'block__header', 'modal__header',)
  header.innerText = 'Удалить клиента'

  let headerBlock = document.createElement('div')
  headerBlock.classList.add('modal__block', 'modal__header_block', 'modal__header__delete')

  let info = document.createElement('p')
  info.classList.add('modal__block', 'modal__text')
  info.innerText = 'Вы действительно хотите удалить данного клиента?'

  let confirmDeleteClientBtn = document.createElement('button')
  confirmDeleteClientBtn.classList.add('btn', 'btn__primary', 'btn__primary__mb5')
  confirmDeleteClientBtn.innerText = 'Удалить'
  confirmDeleteClientBtn.addEventListener('click', confirmDelitingClient)

  async function confirmDelitingClient(event) {

    event.target.removeEventListener('click', confirmDelitingClient)
    event.target.disabled = true

    event.target.prepend(LoadIndicatorOnBtn())

    const response = await deleteClient(id)
    if (response.ok) {
      refreshTable()
      closeModal()
    } else {
      event.target.disabled = false

      event.target.addEventListener('click', confirmDelitingClient)
      createErrorBlock(await response.json(), response.status)
    }
  }

  let abortBtn = document.createElement('button')
  abortBtn.classList.add('btn__only_text', 'btn__link')
  abortBtn.innerText = 'Отмена'
  abortBtn.addEventListener('click', closeModal)

  let buttonsBlock = document.createElement('div')
  buttonsBlock.classList.add('modal__block', 'modal__buttons')
  buttonsBlock.id = 'modal__buttons'

  headerBlock.append(header)
  buttonsBlock.append(confirmDeleteClientBtn, abortBtn)
  modalwindow.append(headerBlock, info, buttonsBlock)

  document.body.append(createModalWindow(modalwindow))
}

function createModalWindow(contentBlock) {

  // удаление всех предыдущих окон
  while (document.getElementById('modal')) {
    let el = document.getElementById('modal')
    el.remove
  }

  let modal = document.createElement('div')

  let closeButton = document.createElement('span')
  closeButton.innerHTML = SVG.closeWindow
  modal.id = 'modal'

  modal.classList.add('modal', 'modal__active')
  contentBlock.classList.add('modal_content')
  closeButton.classList.add('modal__close_btn')
  closeButton.addEventListener('click', closeModal)
  contentBlock.append(closeButton)
  modal.append(contentBlock)

  modal.addEventListener('mousedown', (e) => {

    if (e.target.id === 'modal') closeModal()
  })

  return modal
}

function closeModal() {
  const modal = document.getElementById('modal')
  const modalContent = modal.firstChild

  modal.classList.add('modal_hide')
  modalContent.classList.add('modal_content_hide')
  setTimeout(() => { modal.remove() }, 200)
}

function createErrorBlock(responseBody, status = false) {

  document.getElementById('error')?.remove()
  document.getElementById('load__indicator')?.remove()

  while (document.getElementById('inputs_disable')) {

    document.getElementById('inputs_disable')?.remove()
  }

  let container = document.getElementById('modal__buttons')

  let errorText = document.createElement('p')
  errorText.classList.add('modal__error')
  errorText.id = 'error'

  if (responseBody.errors) {

    // подсвечиваем поле где ошибка
    let errorField = document?.getElementById(responseBody.errors[0].field + '-input')

    if (responseBody.errors[0].field === 'modal-contacts') {

      for (const contact of errorField.childNodes) {
        if (!contact.contactTypeInput.value || !contact.contactValueInput.value) {

          contact.classList.add('error')
          contact.addEventListener('input', removeErrorClass)
          contact.addEventListener('click', removeErrorClass)
        }
      }

    } else {
      errorField.classList.add('error')
      errorField.addEventListener('input', removeErrorClass)
    }

    errorText.innerHTML = `<p>${responseBody.errors[0].message}</p> `

  } else if (responseBody.message) {

    errorText.innerHTML = `<p>Код ошибки:${status}</p><p>${responseBody.message}</p> `

  } else if (status) {

    errorText.innerHTML = `<p>Код ошибки:${status}</p><p>Что-то пошло не так...</p> `

  } else {
    errorText.innerHTML = `<p>Что-то пошло не так...</p> `
  }

  container.prepend(errorText)

  function removeErrorClass(e) {
    let currentElement = e.target

    while (!currentElement.classList.contains("error")) {

      currentElement?.removeEventListener('input', removeErrorClass)
      currentElement?.removeEventListener('click', removeErrorClass)

      if (currentElement.parentElement) {
        currentElement = currentElement.parentElement
      }

      break
    }

    currentElement.classList.remove('error')
    errorText.remove()
  }
}

function addContactInput(contactType = false, contactValue = false, block = null) {

  if (!block) {
    block = document.getElementById('modal-contacts-input')
  }
  block.parentNode.classList.remove('modal__contacts_block__empty')

  let contact = document.createElement('form')
  let deleteBtn = document.createElement('button')
  let valueInput = document.createElement('input')

  let contactTypeInput = document.createElement('select')
  let optionPhone = document.createElement('option')
  let optionEmail = document.createElement('option')
  let optionVK = document.createElement('option')
  let optionFB = document.createElement('option')
  let optionOther = document.createElement('option')

  contact.id = 'contact-set'

  deleteBtn.classList.add('deleteContactInput')
  deleteBtn.innerHTML = SVG.deleteIcon

  optionPhone.innerText = 'Телефон'
  optionEmail.innerText = 'Email'
  optionVK.innerText = 'Vk'
  optionFB.innerText = 'Facebook'
  optionOther.innerText = 'Другое'

  optionPhone.value = 'phone'
  optionEmail.value = 'Email'
  optionVK.value = 'Vk'
  optionFB.value = 'Facebook'
  optionOther.value = 'other'

  contactTypeInput.append(optionPhone)
  contactTypeInput.append(optionEmail)
  contactTypeInput.append(optionVK)
  contactTypeInput.append(optionFB)
  contactTypeInput.append(optionOther)

  valueInput.type = 'text'

  valueInput.id = 'contactValueInput'
  contactTypeInput.id = 'contactTypeInput'

  if (contactType && contactValue) {

    for (let option of contactTypeInput.options) {
      if (option.value === contactType) {
        option.selected = true
      }
    }

    valueInput.value = contactValue

  } else {
    valueInput.placeholder = 'Введите данные контакта'
  }

  createTooltipContact('Удалить контакт', deleteBtn)

  deleteBtn.addEventListener('click', event => {
    event.preventDefault()
    contact.remove()

    checkContactsLimit(contactLimit)
  })

  let customContactTypeInput = createCustomSelect(contactTypeInput)

  contact.append(contactTypeInput)
  contact.append(customContactTypeInput)
  contact.append(valueInput)
  contact.append(deleteBtn)

  block.append(contact)
  checkContactsLimit(contactLimit)

}

function checkContactsLimit(limit) {
  document.getElementById('add_contact_btn')?.classList.toggle('btn__hidden', document.getElementById('modal-contacts-input').children.length > (limit - 1))
}

function LoadIndicatorOnBtn() {

  let container = document.createElement('div')
  container.id = 'load__indicator'
  container.classList.add('loadIndicator__btn')
  container.innerHTML = SVG.loadingIcon
  return container
}

function createCustomSelect(originalSelect) {

  // скрытие оригинального селекта
  originalSelect.style = 'display: none'

  let originalOptions = originalSelect.children

  let selectContainer = document.createElement('div')
  selectContainer.classList.add('custom_select')

  let select = document.createElement('div')
  select.classList.add('custom_select__input')
  select.addEventListener('click', dropdownOpen)

  let selectDropdown = document.createElement('ul')
  selectDropdown.classList.add('custom_select__dropdown')

  select.innerText = originalSelect.firstChild.innerText
  select.dataset.value = originalSelect.value

  for (const option of originalOptions) {

    if (option.selected) {
      select.innerText = option.innerText
      select.dataset.value = option.value
    }

    let item = document.createElement('li')
    item.classList.add('custom_select__item')
    item.addEventListener('click', selectChoose)

    item.innerText = option.innerText
    item.dataset.value = option.value
    selectDropdown.append(item)
  }

  selectContainer.append(select)
  selectContainer.append(selectDropdown)
  return selectContainer

  function dropdownOpen() {
    selectDropdown.classList.add('custom_select__dropdown_active')
    select.classList.add('custom_select__input_active')

    select.removeEventListener('click', dropdownOpen)
    select.addEventListener('click', dropdownClose)


    document.addEventListener('click', dropdownIfClickOutsideClose)
  }

  function dropdownIfClickOutsideClose(e) {

    let isDropdawnOpened = selectDropdown.classList.contains('custom_select__dropdown_active')
    if (!selectContainer.contains(e.target) && isDropdawnOpened) {
      dropdownClose()
      document.removeEventListener('click', dropdownIfClickOutsideClose)
    }
  }

  function dropdownClose() {

    selectDropdown.classList.remove('custom_select__dropdown_active')
    select.classList.remove('custom_select__input_active')

    select.removeEventListener('click', dropdownClose)
    select.addEventListener('click', dropdownOpen)
  }

  function selectChoose(e) {
    originalSelect.value = e.target.dataset.value
    select.dataset.value = e.target.dataset.value
    select.innerText = e.target.innerText
    dropdownClose()
  }
}
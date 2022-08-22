export {createClientPage}

function createClientPage(client) {

  // основная часть страницы
  let clientPage = document.createElement('div')

  let toMainBtn = document.createElement('button')
  toMainBtn.classList.add('btn', 'btn__primary', 'btn__return')
  toMainBtn.innerText = 'Вернуться на главную'
  toMainBtn.onclick = () => location.hash = ''
  clientPage.append(toMainBtn)

  // блок с именем и ID
  let clientHeaderContainer = document.createElement('div')
  clientHeaderContainer.classList.add('profile_name', 'container')

  let clientFullname = document.createElement('h1')
  clientFullname.classList.add('client_name')
  clientFullname.innerText = `${client.surname} ${client.name} ${client.lastName}`

  let clientID = document.createElement('p')
  clientID.classList.add('client_id')
  clientID.innerText = 'ID: ' + client.id

  let clientNameAndIdContainer = document.createElement('div')
  clientNameAndIdContainer.classList.add('flex')
  clientNameAndIdContainer.append(clientFullname, clientID)

  let updateClientBtn = document.createElement('button')
  updateClientBtn.classList.add('btn', 'btn__primary', 'btn_disabled')
  updateClientBtn.innerText = 'Изменить клиента'

  let deleteClientBtn = document.createElement('button')
  deleteClientBtn.classList.add('btn', 'btn__primary', 'btn_disabled')
  deleteClientBtn.innerText = 'Удалить клиента'

  let buttonsContainer = document.createElement('div')
  buttonsContainer.classList.add('flex')
  buttonsContainer.append(updateClientBtn, deleteClientBtn)

  clientHeaderContainer.append(clientNameAndIdContainer, buttonsContainer)

  // блок с контактами  
  let clientContactsBlock = document.createElement('div')
  clientContactsBlock.classList.add('main_info__block', 'main_info__contacts')

  let clientContactsHeader = document.createElement('h2')
  clientContactsHeader.classList.add('main_info__block__header')
  clientContactsHeader.innerText = 'Контакты'

  let clientContactsContent = document.createElement('div')
  clientContactsContent.classList.add('main_info__block__content', 'main_info__contacts')

  let clientContactsList = document.createElement('ul')
  clientContactsList.classList.add('main_info__contacts__list')

  if (client.contacts.length) {
    for (const contact of client.contacts) {
      let contactContainer = document.createElement('li')
      contactContainer.classList.add('contacts__list_item')

      let contactText = document.createElement('p')

      switch (contact.type) {
        case 'phone':
          contactText.innerText = 'Телефон: ' + contact.value
          break

        case 'Vk':
          contactText.innerText = 'Вконтакте: ' + contact.value
          break

        case 'Facebook':
          contactText.innerText = 'Facebook: ' + contact.value
          break

        case 'Email':
          contactText.innerText = 'E-mail: ' + contact.value
          break

        default:
          contactText.innerText = 'Доп. контакт: ' + contact.value
          break
      }

      let contactEditBtn = document.createElement('button')
      contactEditBtn.classList.add('btn_contact')
      contactEditBtn.innerText = 'Редактировать'

      let contactDeleteBtn = document.createElement('button')
      contactDeleteBtn.classList.add('btn_contact')
      contactDeleteBtn.innerText = 'Удалить'

      contactContainer.append(contactText)

      clientContactsList.append(contactContainer)
    }

  } else {
    let contactContainer = document.createElement('li')
    contactContainer.classList.add('contacts__list_item_centered')

    contactContainer.innerText = 'Список контактов пуст'

    clientContactsList.append(contactContainer)
  }

  let clientAddContact = document.createElement('button')
  clientAddContact.classList.add('btn', 'btn__primary', 'btn__block', 'btn_disabled', 'btn_centered')
  clientAddContact.innerText = 'Добавить контакт'

  clientContactsContent.append(clientContactsList, clientAddContact)
  clientPage.append(clientHeaderContainer, clientContactsContent)

  return clientPage
}
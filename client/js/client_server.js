export { addClient, updateClient, deleteClient, getClients, getClient , getListOfClients , getClientByID }

// Доступные методы:
// GET /api/clients - получить список клиентов, в query параметр search можно передать поисковый запрос

// POST /api/clients - создать клиента, в теле запроса нужно передать объект { name: string, surname: string, lastName?: string, contacts?: object[] }
//         contacts - массив объектов контактов вида { type: string, value: string }

// GET /api/clients/{id} - получить клиента по его ID

// PATCH /api/clients/{id} - изменить клиента с ID, в теле запроса нужно передать объект { name?: string, surname?: string, lastName?: string, contacts?: object[] }
//         contacts - массив объектов контактов вида { type: string, value: string }

// DELETE /api/clients/{id} - удалить клиента по ID

const PORT = 3000;
const URL = 'http://localhost:' + PORT;

async function addClient(client) {

  let data = await fetch(`${URL}/api/clients`, {
    method: 'POST',
    body: JSON.stringify(client)
  })

  return data
}

async function updateClient(id, client) {
  let data = await fetch(`${URL}/api/clients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(client)
  })
  return data
}

async function deleteClient(id) {
  return await fetch(`${URL}/api/clients/${id}`, { method: 'DELETE' })
}

async function getClients(filter = null) {

  let data, getParam;

  filter ? getParam = `?search=${filter}` : getParam = '';
  data = fetch(`${URL}/api/clients${getParam}`)

  return data
}

async function getClient(id) {

  return await fetch(`${URL}/api/clients/${id}`)
}

async function getListOfClients(filter = null) {
  let response = await getClients(filter)
  let clients = await response.json()
  return clients
}

// получение одного клиента по ID
async function getClientByID(ID) {
  let response = await getClient(ID)
  let client = await response.json()
  return [client]
}
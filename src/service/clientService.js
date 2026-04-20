import { api } from 'boot/axios'

export const getClients = () => {
  return api
    .get('v1/company/web')
    .then((response) => response)
    .catch((error) => {
      console.error(error)

      throw error
    })
}

export const createClient = (body) => {
  return api
    .post('v1/company/web', body)
    .then((response) => response)
    .catch((error) => {
      console.error(error)

      throw error
    })
}

export const updateClient = (body, id) => {
  return api
    .put(`v1/company/web/${id}`, body)
    .then((response) => response)
    .catch((error) => {
      console.error(error)

      throw error
    })
}

export const deleteClient = (id) => {
  return api
    .delete(`v1/company/web/${id}`)
    .then((response) => response)
    .catch((error) => {
      console.error(error)

      throw error
    })
}

export const getClientsToEquipament = () => {
  return api
    .get(`v1/company/web/to-equipament`)
    .then((response) => response)
    .catch((error) => {
      console.error(error)

      if (error.response) {
        return error.response
      }

      return null
    })
}

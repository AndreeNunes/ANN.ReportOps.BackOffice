import { api } from 'boot/axios'

export const getInfoCep = (cep) => {
  return api
    .get(`v1/utility/cep/${cep}`)
    .then((response) => response)
    .catch((error) => {
      console.error(error)

      throw error
    })
}

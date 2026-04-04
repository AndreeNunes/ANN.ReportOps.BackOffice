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

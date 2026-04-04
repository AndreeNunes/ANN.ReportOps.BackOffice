import { api } from 'boot/axios'

export const loginService = (email, password) => {
  const payload = {
    email,
    password,
  }

  return api
    .post('v1/web/login', payload)
    .then((response) => response)
    .catch((error) => {
      console.error(error)

      throw error
    })
}

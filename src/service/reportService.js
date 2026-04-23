import { api } from 'boot/axios'

export const getOrders = () => {
  return api
    .get('v1/report/orders/web')
    .then((response) => response)
    .catch((error) => {
      console.error(error)

      throw error
    })
}

export const getOrderById = (orderId) => {
  return api
    .get(`v1/report/orders/${orderId}/web`)
    .then((response) => response)
    .catch((error) => {
      console.error(error)

      throw error
    })
}

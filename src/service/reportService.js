import { api } from 'boot/axios'

export const getOrderCounts = () => {
  return api
    .get('v1/report/order-counts/web')
    .then((response) => response)
    .catch((error) => {
      console.error(error)

      throw error
    })
}

export const getOrdersByCompany = (idCompany) => {
  return api
    .get(`v1/report/${idCompany}/orders/web`)
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

export default {
  getOrderCounts,
  getOrdersByCompany,
  getOrderById,
}

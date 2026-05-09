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

export const getDashboard = () => {
  return api
    .get('v1/report/dashboard/web')
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

export const createReport = (body) => {
  return api
    .post('v1/report/web', body)
    .then((response) => response)
    .catch((error) => {
      if (error.response) return error.response
      return null
    })
}

export const addReportReference = (body) => {
  return api
    .post('v1/report/reference/web', body)
    .then((response) => response)
    .catch((error) => {
      if (error.response) return error.response
      return null
    })
}

export const updateReportReference = (body) => {
  return api
    .put('v1/report/reference/web', body)
    .then((response) => response)
    .catch((error) => {
      if (error.response) return error.response
      return null
    })
}

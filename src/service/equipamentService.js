import { api } from 'boot/axios'

export const getEquipamentById = (id) => {
  return api
    .get(`v1/equipament/web/${id}`)
    .then((response) => response)
    .catch((error) => {
      if (error.response) {
        return error.response;
      }

      return null;
    })
}

export const createEquipament = (body, idCompany) => {
  return api
    .post(`v1/equipament/web/${idCompany}`, body)
    .then((response) => response)
    .catch((error) => {
      if (error.response) {
        return error.response;
      }

      return null;
    })
}

export const updateEquipament = (body, id) => {
  return api
    .put(`v1/equipament/web/${id}`, body)
    .then((response) => response)
    .catch((error) => {
      if (error.response) {
        return error.response;
      }

      return null;
    })
}

export const getEquipaments = () => {
  return api
    .get("v1/equipament/web")
    .then((response) => response)
    .catch((error) => {
      if (error.response) {
        return error.response;
      }

      return null;
    });
};

export const deleteEquipament = (idCompany, id) => {
  return api
    .delete(`v1/equipament/web/${idCompany}/${id}`)
    .then((response) => response)
    .catch((error) => {
      if (error.response) {
        return error.response;
      }

      return null;
    });
};

export const getEquipamentsByCompany = (idCompany) => {
  return api
    .get(`v1/equipament/web/names/${idCompany}`)
    .then((response) => response)
    .catch((error) => {
      if (error.response) {
        return error.response;
      }

      return null;
    });
}

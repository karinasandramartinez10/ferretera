import { api } from "../config";
import { api as privateApi } from "../config/private";

export const getProductTypes = async () => {
  try {
    const { data } = await api.get("/product-types");
    return data;
  } catch (error) {
    throw new Error(error.response.data.message);
  }
};

export const createProductType = async (body) => {
  try {
    const { data } = await privateApi.post("/product-types", body);
    return data;
  } catch (error) {
    console.error("Error creating product type:", error);
    throw new Error(error.response.data.message);
  }
};

export const updateProductType = async (id, body) => {
  try {
    const { data } = await privateApi.put(`/product-types/${id}`, body);
    return data;
  } catch (error) {
    console.error("Error updating product type:", error);
    throw new Error(error.response.data.message);
  }
};

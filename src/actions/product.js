"use server";

export async function fetchAllProductsServer(page = 1, size = 10) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/product?page=${page}&size=${size}`
    );

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${await res.text()}`);
    }

    const response = await res.json();

    const products = response.data.products ?? [];

    return products;
  } catch (error) {
    console.error("error", error);
    return [];
  }
}

export const getProductById = async (id) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/product/${id}`
    );

    const response = await res.json();
    return response;
  } catch (error) {
    console.log("e", error);
    return {};
  }
};

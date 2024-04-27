//TODO: mover a 10
export async function fetchProducts(page = 1, size = 10) {
  const res = await fetch(
    `http://localhost:8000/api/v1/product?page=${page}&size=${size}`
  );

  if (!res.ok) {
    return {
      error: "Failed to fetch data",
    };
  }

  const response = await res.json();
  return {
    data: response.data,
    error: false,
  };
}

import { getBrandsServer } from "../../actions/brand";
import { fetchAllProductsServer } from "../../actions/product";
import { auth } from "../../auth";
import { MainPage } from "./MainPage";

export default async function Page() {
  const session = await auth();
  const brands = await getBrandsServer();
  const products = await fetchAllProductsServer();

  return (
    <MainPage
      session={session}
      brands={brands}
      products={products}
    />
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { Grid, Typography } from "@mui/material";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ErrorUI } from "../../../../components/Error";
import { Loading } from "../../../../components/Loading";
import NoProductsUI from "../../../../components/NoProducts";
import {
  toCapitalizeFirstLetter,
  toSlug,
  transformCategoryPath,
} from "../../../../utils/cases";
import { getProductsByCategory } from "../../../../api/products";
import { ProductCard } from "../../../../components/ProductCard";
import Pagination from "../../../../components/Pagination";
import BreadcrumbsNavigation from "../../../../components/BreadcrumbsNavigation";

const CategoryProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [size] = useState(10);

  const { name } = useParams();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");

  const decodedName = decodeURIComponent(name);
  const formattedName = transformCategoryPath(decodedName);

  const breadcrumbItems = [
    { label: "Inicio", path: "/" },
    {
      label: toCapitalizeFirstLetter(formattedName),
      path: `/categories/${toSlug(formattedName)}?id=${categoryId}`,
    },
  ];

  const router = useRouter();

  const handleProductClick = (id) => {
    router.push(`/product/${id}`);
  };
  const fetchProducts = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const { products, totalPages } = await getProductsByCategory(
          categoryId,
          page,
          size
        );
        setProducts(products);
        setTotalPages(totalPages);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(true);
        console.error("Error fetching products:", error);
      }
    },
    [categoryId, size]
  );

  useEffect(() => {
    if (name && categoryId) {
      fetchProducts(currentPage);
    }
  }, [name, categoryId, currentPage, fetchProducts]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchProducts(newPage);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) return <ErrorUI />;

  if (products.length === 0)
    return <NoProductsUI config={{ type: "categoría", types: "categorías" }} />;

  const productList = products.map((product, index) => (
    <Grid item xs={12} sm={4} md={4} key={index}>
      <ProductCard
        key={product.id}
        product={product}
        onViewMore={handleProductClick}
      />
    </Grid>
  ));

  return (
    <Grid container>
      <Grid item xs={12}>
        <BreadcrumbsNavigation items={breadcrumbItems} />
        <Typography
          component="h1"
          variant="h1"
          mt={{
            xs: 1,
            md: 2,
          }}
          mb={{
            xs: 1,
            md: 2,
          }}
        >
          {toCapitalizeFirstLetter(formattedName)}
        </Typography>
      </Grid>
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12 }}
        sx={{ minHeight: "500px" }}
      >
        {productList}
      </Grid>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </Grid>
  );
};

export default CategoryProductsPage;

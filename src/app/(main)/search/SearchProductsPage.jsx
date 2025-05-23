"use client";

import { useCallback, useEffect, useState } from "react";
import { Grid, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { ErrorUI } from "../../../components/Error";
import { Loading } from "../../../components/Loading";
import { getProductsByQuery } from "../../../api/products";
import { ProductCard } from "../../../components/ProductCard";
import NoProductsUI from "../../../components/NoProducts";
import Pagination from "../../../components/Pagination";

const SearchProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [size] = useState(10);

  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const router = useRouter();

  const handleProductClick = (id) => {
    router.push(`/product/${id}`);
  };

  const fetchProducts = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const { products, totalPages } = await getProductsByQuery(
          query,
          page,
          size
        );
        setProducts(products);
        setTotalPages(totalPages);
        setLoading(false);
      } catch (error) {
        setError(true);
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    },
    [query, size]
  );

  useEffect(() => {
    if (query) {
      fetchProducts(currentPage);
    }
  }, [query, currentPage, fetchProducts]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) return <ErrorUI />;

  if (products.length === 0)
    return <NoProductsUI config={{ type: "búsqueda", types: "búsquedas" }} />;

  const productList = products.map((product, index) => (
    <Grid item xs={12} sm={4} md={4} key={index}>
      <ProductCard
        key={product.id}
        product={product}
        src={product.Files[0]?.path}
        alt={product.name}
        onViewMore={handleProductClick}
      />
    </Grid>
  ));

  return (
    <Grid container>
      <Typography component="h1" variant="h1" mb={2}>
        Resultados para {query}
      </Typography>

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

export default SearchProductsPage;

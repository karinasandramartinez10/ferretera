"use client";

import { useEffect, useState } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useParams, useSearchParams } from "next/navigation";
import { ErrorUI } from "../../../../components/Error";
import { Loading } from "../../../../components/Loading";
import { getProductsByBrand } from "../../../../api/products";
import { toCapitalizeFirstLetter } from "../../../../utils/cases";
import { ProductCard } from "../../../../components/ProductCard";

const BrandProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [size] = useState(10);

  const { name } = useParams();
  const searchParams = useSearchParams();
  const brandId = searchParams.get("id");

  useEffect(() => {
    const fetchProducts = async (page = 1) => {
      setLoading(true);
      try {
        const { products, totalPages } = await getProductsByBrand(
          brandId,
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
    };

    if (name && brandId) {
      fetchProducts(currentPage);
    }
  }, [name, brandId, currentPage]);

  const handlePageChange = (direction) => {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) return <ErrorUI main />;

  if (products.length === 0)
    return (
      <Grid>
        <Typography textAlign="center" variant="h2">
          No hay productos para esta marca
        </Typography>
      </Grid>
    );

  const productList = products.map((product, index) => (
    <Grid item xs={12} sm={4} md={4} key={index}>
      <ProductCard key={product.id} product={product} />
    </Grid>
  ));

  return (
    <Grid container>
      <Typography component="h1" variant="h1" mb={2}>
        Productos para {toCapitalizeFirstLetter(name)}
      </Typography>

      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12 }}
        sx={{ minHeight: "500px" }}
      >
        {productList}
      </Grid>

      {totalPages > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 5,
            alignItems: "baseline",
            width: "100%",
          }}
        >
          <Button
            variant="contained"
            disabled={currentPage === 1}
            onClick={() => handlePageChange("prev")}
          >
            Página anterior
          </Button>
          <Typography sx={{ mx: 2 }}>
            Página {currentPage} de {totalPages}
          </Typography>
          <Button
            variant="contained"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange("next")}
          >
            Página siguiente
          </Button>
        </Box>
      )}
    </Grid>
  );
};

export default BrandProductsPage;

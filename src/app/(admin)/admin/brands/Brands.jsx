"use client";

import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import {
  createBrand,
  getBrands,
  updateBrand,
  deleteBrand,
} from "../../../../api/admin/brands";
import BrandModal from "./BrandModal";
import BrandsTable from "./BrandsTable";
import { useSnackbar } from "notistack";
import { toCamelCase, toCapitalizeFirstLetter } from "../../../../utils/cases";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

const Brands = ({ user }) => {
  const [rows, setRows] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [mode, setMode] = useState("create");

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const brandsData = await getBrands();
        setRows(brandsData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  const handleAddBrand = async (data) => {
    if (!data.image || data.image.length === 0) {
      enqueueSnackbar("Debes agregar una imagen", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", toCapitalizeFirstLetter(data.name));
      formData.append("codeName", toCamelCase(data.name));
      formData.append("image", data.image);

      const response = await createBrand(formData, user.access_token);
      if (response.status === 201) {
        const { brand, file } = response.data;
        const newBrand = {
          ...brand,
          id: brand.id,
          imageUrl: file.path,
        };

        setRows((prevRows) => [...prevRows, newBrand]);
        enqueueSnackbar("Marca agregada exitósamente", {
          variant: "success",
          autoHideDuration: 5000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
        setLoading(false);
        setIsModalOpen(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error creating brand:", error);
    }
  };

  const handleEditBrand = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", toCapitalizeFirstLetter(data.name));
      formData.append("codeName", toCamelCase(data.name));
      if (data.image) {
        formData.append("image", data.image);
      }

      const response = await updateBrand(
        selectedBrand.id,
        formData,
        user.access_token
      );

      if (response.status === 200) {
        const { brand, file } = response.data;
        const updatedBrand = {
          ...brand,
          id: brand.id,
          imageUrl: file?.path || selectedBrand.File?.path, // Mantén la imagen anterior si no se actualizó.
        };

        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === selectedBrand.id ? { ...row, ...updatedBrand } : row
          )
        );
        enqueueSnackbar("Marca actualizada exitósamente", {
          variant: "success",
        });
        setLoading(false);
        setIsModalOpen(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error actualizando la marca", error.message);
    }
  };

  const handleDeleteBrand = async () => {
    try {
      setLoading(true);
      await deleteBrand(selectedBrand.id, user.access_token);
      setRows((prevRows) =>
        prevRows.filter((row) => row.id !== selectedBrand.id)
      );
      enqueueSnackbar("Marca eliminada exitósamente", {
        variant: "success",
        autoHideDuration: 5000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
      setLoading(false);
      setIsDialogOpen(false);
    } catch (error) {
      setLoading(false);
      enqueueSnackbar("Hubo un error al eliminar la marca", {
        variant: "error",
        autoHideDuration: 5000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
    }
  };

  const openEditModal = (brand) => {
    setSelectedBrand(brand);
    setMode("edit");
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedBrand(null);
    setMode("create");
    setIsModalOpen(true);
  };

  const openDeleteDialog = (brand) => {
    setSelectedBrand(brand);
    setIsDialogOpen(true);
  };

  return (
    <Grid container width={"100%"} gap={2} flexDirection="row">
      <Grid item xs={12}>
        <Stack>
          <Typography variant="h1">Marcas</Typography>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography
              sx={{ color: "#838383", fontWeight: 500 }}
              variant="body"
            >
              Agrega, edita o elimina tus proveedores
            </Typography>
            <Button onClick={openAddModal}>Agregar</Button>
          </Box>
        </Stack>
      </Grid>
      <BrandsTable
        rows={rows}
        onEditClick={openEditModal}
        onDeleteClick={openDeleteDialog}
      />
      <BrandModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={mode === "create" ? handleAddBrand : handleEditBrand}
        mode={mode}
        selectedBrand={selectedBrand}
        loading={loading}
      />
      <DeleteConfirmationDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDeleteBrand}
        loading={loading}
        title="Eliminar Marca"
        description={`¿Estás seguro de que quieres eliminar la marca "${selectedBrand?.name}"? Esta acción no se puede deshacer.`}
      />
    </Grid>
  );
};

export default Brands;

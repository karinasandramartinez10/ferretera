"use client";

import { Visibility } from "@mui/icons-material";
import { Box, IconButton, Stack, styled } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { fetchQuotes } from "../../../../api/quote";
import { ErrorUI } from "../../../../components/Error";
import { Loading } from "../../../../components/Loading";
import { formatDateDayAbrev } from "../../../../utils/date";
import { formatPhoneNumber } from "../../../../utils/phoneNumber";

const StyledGridOverlay = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  "& .ant-empty-img-1": {
    fill: theme.palette.mode === "light" ? "#aeb8c2" : "#262626",
  },
  "& .ant-empty-img-2": {
    fill: theme.palette.mode === "light" ? "#f5f5f7" : "#595959",
  },
  "& .ant-empty-img-3": {
    fill: theme.palette.mode === "light" ? "#dce0e6" : "#434343",
  },
  "& .ant-empty-img-4": {
    fill: theme.palette.mode === "light" ? "#fff" : "#1c1c1c",
  },
  "& .ant-empty-img-5": {
    fillOpacity: theme.palette.mode === "light" ? "0.8" : "0.08",
    fill: theme.palette.mode === "light" ? "#f5f5f5" : "#fff",
  },
}));

function CustomNoRowsOverlay() {
  return (
    <StyledGridOverlay>
      <svg
        width="120"
        height="100"
        viewBox="0 0 184 152"
        aria-hidden
        focusable="false"
      >
        <g fill="none" fillRule="evenodd">
          <g transform="translate(24 31.67)">
            <ellipse
              className="ant-empty-img-5"
              cx="67.797"
              cy="106.89"
              rx="67.797"
              ry="12.668"
            />
            <path
              className="ant-empty-img-1"
              d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
            />
            <path
              className="ant-empty-img-2"
              d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
            />
            <path
              className="ant-empty-img-3"
              d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
            />
          </g>
          <path
            className="ant-empty-img-3"
            d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
          />
          <g className="ant-empty-img-4" transform="translate(149.65 15.383)">
            <ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815" />
            <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
          </g>
        </g>
      </svg>
      <Box sx={{ mt: 1 }}>Aún no hay cotizaciones</Box>
    </StyledGridOverlay>
  );
}

const calculateTotalQuantity = (products) => {
  return products?.reduce(
    (acc, product) => acc + (product?.QuoteProduct?.quantity || 0),
    0
  );
};

export const Quotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { data } = useSession();

  const columns = [
    {
      field: "actions",
      headerName: "Detalle",
      width: 85,
      renderCell: (params) => (
        <Stack>
          <Link href={`/admin/quotes/${params.row.id}`} passHref>
            <IconButton>
              <Visibility />
            </IconButton>
          </Link>
        </Stack>
      ),
    },
    // { field: "id", headerName: "ID", width: 85 },
    {
      field: "fullname",
      headerName: "Cliente",
      sortable: true,
      width: 170,
      valueGetter: (_, row) =>
        `${row?.User?.firstName || ""} ${row?.User?.lastName || ""}`,
    },
    {
      field: "product",
      headerName: "# Productos",
      width: 150,
      valueGetter: (_, row) => row?.Products?.length || "",
    },
    {
      field: "quantity",
      headerName: "Cantidad Total",
      width: 150,
      valueGetter: (_, row) => calculateTotalQuantity(row?.Products),
    },
    {
      field: "email",
      headerName: "Email",
      width: 170,
      sortable: true,
      valueGetter: (_, row) => row?.User?.email || "",
    },
    {
      field: "phoneNumber",
      headerName: "Teléfono",
      width: 150,
      valueGetter: (_, row) => formatPhoneNumber(row?.User?.phoneNumber) || "",
    },
    {
      field: "createdAt",
      headerName: "Fecha",
      width: 140,
      valueFormatter: (val) => {
        if (val == null) {
          return "";
        }
        return formatDateDayAbrev(val);
      },
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { quotes, totalCount } = await fetchQuotes(
          data.user.access_token,
          paginationModel.page + 1, // Ajustar para backend (MUI usa base 0, backend usa base 1)
          paginationModel.pageSize
        );
        setLoading(false);
        setQuotes(quotes);
        setTotalCount(totalCount || 0);
      } catch (error) {
        setLoading(false);
        setError(true);
      }
    };

    fetchData();
  }, [data.user.access_token, paginationModel]);

  if (loading) {
    return <Loading />;
  }

  if (error) return <ErrorUI />;

  return (
    <Box sx={{ height: { xs: 550, md: 700 }, width: "100%" }}>
      <DataGrid
        rows={quotes}
        columns={columns}
        rowCount={totalCount}
        paginationMode="server"
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 20]}
        disableRowSelectionOnClick
        sx={{
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 700,
          },
          "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
            outline: "none !important",
          },
        }}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
        }}
      />
    </Box>
  );
};

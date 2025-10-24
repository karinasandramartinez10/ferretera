"use client";

import { Box, Card, CardContent, CardHeader, Stack, Typography, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { fetchQuoteById, updateQuote } from "../../../../../api/quote";
import { ErrorUI } from "../../../../../components/Error";
import { Loading } from "../../../../../components/Loading";
import QuoteProductCard from "./QuoteProductCard";
import QuoteDetails from "./QuoteDetails";
import { useSnackbar } from "notistack";
import { STEPS } from "../../../../../constants/quotes/status";
import { StatusLogList } from "./StatusLogList";
import { useStatusLogs } from "../../../../../hooks/logs/useStatusLogs";
import QuoteMessages from "../../../../../components/QuoteMessages";
import { buildTableHtml, openPrintWindow } from "../../../../../utils/print";

export const QuoteId = ({ quoteId }) => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [justSavedIdx, setJustSavedIdx] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  const { logsMap, loadingMap, fetchLogs, appendLog } = useStatusLogs();

  useEffect(() => {
    if (!quoteId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedQuote = await fetchQuoteById(quoteId);
        if (!fetchedQuote) {
          throw new Error("Cotización no encontrada");
        }
        setQuote(fetchedQuote);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quoteId]);

  useEffect(() => {
    fetchLogs(quoteId);
  }, [quoteId]);

  const handleCall = () => {
    window.location.href = `tel: ${quote?.User?.phoneNumber}`;
  };

  const handleEmail = () => {
    window.location.href = `mailto:${
      quote?.User?.email
    }?subject=${encodeURIComponent("Cotización")}&body=${encodeURIComponent(
      `Hola ${quote?.User?.firstName}`
    )}`;
  };

  const handlePrint = () => {
    if (!quote) return;

    const headerRows = [
      ["# Orden", quote.orderNumber ?? quote.order ?? ""],
      ["Cliente", `${quote?.User?.firstName ?? ""} ${quote?.User?.lastName ?? ""}`.trim()],
      ["Email", quote?.User?.email ?? ""],
      ["Teléfono", quote?.User?.phoneNumber ?? ""],
      ["Fecha", new Date(quote?.createdAt).toLocaleString("es-MX")],
      ["Estado", quote?.status ?? ""],
      ["Mensaje", quote?.message ?? ""],
    ];

    const headerTable = buildTableHtml({
      caption: "Detalle de cotización",
      headers: ["Campo", "Valor"],
      rows: headerRows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`),
    });

    const productHeaders = ["Producto", "Marca", "SKU", "Cantidad"];
    const productRows = (quote?.Products ?? []).map((p) => (
      `<tr>
        <td>${p?.name ?? ""}</td>
        <td>${p?.brand?.name ?? ""}</td>
        <td>${p?.code ?? ""}</td>
        <td>${p?.QuoteProduct?.quantity ?? ""}</td>
      </tr>`
    ));

    const productsTable = buildTableHtml({
      caption: "Productos",
      headers: productHeaders,
      rows: productRows,
    });

    openPrintWindow(`${headerTable}<br/>${productsTable}`, { title: `Cotización ${quote.orderNumber ?? ""}` });
  };

  const handleSaveStatus = async (newStatus) => {
    const oldStatus = quote.status;
    try {
      await updateQuote(quoteId, { status: newStatus });
      setQuote((q) => ({ ...q, status: newStatus }));

      const idx = STEPS.findIndex((s) => s.value === newStatus);
      setJustSavedIdx(idx);

      await appendLog(quoteId, {
        oldStatus,
        newStatus,
        changedAt: new Date().toISOString(),
      });

      enqueueSnackbar("Estado actualizado", { variant: "success" });
      setTimeout(() => setJustSavedIdx(null), 800);
    } catch {
      enqueueSnackbar("Error al actualizar estado", { variant: "error" });
    }
  };

  if (error) {
    return <ErrorUI message="Error cargando los detalles de la cotización" />;
  }

  if (loading) return <Loading />;

  if (!quote) {
    return <ErrorUI message="No se encontró la cotización solicitada." />;
  }

  return (
    <Stack gap={2}>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={handlePrint}>Imprimir</Button>
      </Box>
      <QuoteDetails
        quote={quote}
        justSavedIdx={justSavedIdx}
        onCall={handleCall}
        onEmail={handleEmail}
        onSave={handleSaveStatus}
      />
      <StatusLogList
        logs={logsMap[quoteId] || []}
        loading={loadingMap[quoteId]}
      />

      <Card variant="outlined" sx={{ p: 1 }}>
        <CardHeader title="Productos Cotizados" />
        <CardContent sx={{ pt: 0 }}>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            }}
          >
            {quote?.Products?.map((product) => (
              <QuoteProductCard key={product.id} product={product} />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Sistema de mensajes */}
      <Card variant="outlined" sx={{ p: 2 }}>
        <CardHeader title="Mensajes" />
        <CardContent>
          <QuoteMessages quoteId={quoteId} />
        </CardContent>
      </Card>
    </Stack>
  );
};

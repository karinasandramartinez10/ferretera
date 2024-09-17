"use client"; // TODO: check if we can remove

import { SnackbarProvider } from "notistack";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { mainTheme } from "../theme/mainTheme";
import { OrderProvider } from "../context/order/OrderProvider";

export function Providers({ children }) {
  return (
    <ThemeProvider theme={mainTheme}>
      <SnackbarProvider maxSnack={3}>
        <CssBaseline />
        <OrderProvider>{children}</OrderProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default Providers;

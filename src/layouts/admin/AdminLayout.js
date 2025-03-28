"use client";

import {
  AddBusiness,
  AddCircleOutline,
  Home,
  Storefront,
  Category,
  Inventory,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Drawer,
  Grid,
  List,
  ListItem,
  ListItemButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import useResponsive from "../../hooks/use-responsive";
import AdminNavbarMobile from "../../navbars/admin/AdminNavbarMobile";

const drawerWidth = 200;

const listItems = [
  {
    text: "Inicio",
    pathname: "/",
    icon: <Home sx={{ fontSize: 20 }} />,
    visibleFor: ["admin", "superadmin"],
  },
  {
    text: "Cotizaciones",
    pathname: "/admin/quotes",
    icon: <Storefront sx={{ fontSize: 20 }} />,
    isDynamic: true,
    visibleFor: ["admin", "superadmin"],
  },
  {
    text: "Agregar Productos",
    pathname: "/admin/add-product",
    icon: <AddCircleOutline sx={{ fontSize: 20 }} />,
    visibleFor: ["superadmin"],
  },
  {
    text: "Ver productos",
    pathname: "/admin/products",
    icon: <Inventory sx={{ fontSize: 20 }} />,
    visibleFor: ["admin", "superadmin"],
  },
  {
    text: "Marcas",
    pathname: "/admin/brands",
    icon: <AddBusiness sx={{ fontSize: 20 }} />,
    visibleFor: ["superadmin"],
  },
  {
    text: "Categorías",
    pathname: "/admin/categories",
    icon: <Category sx={{ fontSize: 20 }} />,
    visibleFor: ["superadmin"],
  },
  {
    text: "Subcategorías",
    pathname: "/admin/subcategories",
    icon: <Category sx={{ fontSize: 20 }} />,
    visibleFor: ["superadmin"],
  },
  {
    text: "Tipos de producto",
    pathname: "/admin/product-type",
    icon: <Category sx={{ fontSize: 20 }} />,
    visibleFor: ["superadmin"],
  },
];

const getPageTitle = (pathname) => {
  if (pathname === "/admin/add-product") return "Productos";
  if (pathname === "/admin/quotes") return "Todas las cotizaciones";
  if (pathname.startsWith("/admin/quotes/")) return "Detalles de la cotización";
  return;
};

const getPageSubtitle = (pathname) => {
  if (pathname === "/admin/add-product") return "Agregar productos";
  return;
};

export const AdminLayout = ({ children, role }) => {
  const [_, setIsClosing] = useState(false);

  const isMobile = useResponsive("down", "sm");

  const pathname = usePathname();

  const handleDrawerClose = () => {
    setIsClosing(true);
  };

  const drawer = useMemo(
    () => (
      <List sx={{ paddingX: 2, borderRadius: 1, paddingTop: 0 }}>
        <Box width="100%" padding={2} position="relative" height="100px">
          <NextLink href="/">
            <Image
              src={"/images/texcoco_logo2.svg"}
              alt="ferreteria texcoco"
              fill
            />
          </NextLink>
        </Box>
        <Stack gap={1}>
          {listItems
            .filter((item) => item.visibleFor.includes(role))
            .map((item) => (
              <NextLink key={item.text} href={item.pathname}>
                <ListItem disablePadding>
                  <ListItemButton
                    sx={(theme) => ({
                      color:
                        pathname === item.pathname ||
                        (item.isDynamic && pathname.startsWith(item.pathname))
                          ? "#FFF"
                          : theme.palette.primary.main,
                      borderRadius: 2,
                      alignItems: "flex-start",
                      gap: 1,
                      backgroundColor:
                        pathname === item.pathname ||
                        (item.isDynamic && pathname.startsWith(item.pathname))
                          ? theme.palette.primary.hover
                          : "transparent",
                      "&:hover": {
                        color: "#FFF",
                        backgroundColor: theme.palette.primary.hover,
                        transition: "background-color 0.3s ease",
                      },
                    })}
                    onClick={() => handleDrawerClose()}
                  >
                    {item.icon}
                    {item.text}
                  </ListItemButton>
                </ListItem>
              </NextLink>
            ))}
        </Stack>
      </List>
    ),
    [pathname]
  );

  return (
    <Box
      component="section"
      sx={{
        margin: "0 auto",
        maxWidth: "1440px",
      }}
    >
      <Box component="nav" sx={{ display: { xs: "block", sm: "none" } }}>
        <AppBar>
          <Toolbar sx={{ paddingRight: "8px" }}>
            <AdminNavbarMobile role={role} />
          </Toolbar>
        </AppBar>
      </Box>
      <main
        style={{
          width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`,
          marginLeft: isMobile ? 0 : drawerWidth,
          padding: isMobile ? "16px" : "24px",
        }}
      >
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            width: "100%",
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {drawer}
        </Drawer>

        <Grid
          sx={{ marginTop: { xs: "58px", sm: "0" } }}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <Grid item xs={12}>
            <Stack>
              <Typography variant="h1">{getPageTitle(pathname)}</Typography>
              <Typography
                sx={{ color: "#838383", fontWeight: 500 }}
                variant="body"
              >
                {getPageSubtitle(pathname)}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            {children}
          </Grid>
        </Grid>
      </main>
      <footer></footer>
    </Box>
  );
};

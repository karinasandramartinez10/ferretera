"use client";
import dynamic from "next/dynamic";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Popover,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  adminSectionsMobile,
  noAuthSectionsMobile,
  userSectionsMobile,
} from "./list-items";
import { BurgerMenu } from "../../components/BurgerMenu";
import { Menu, Person } from "@mui/icons-material";
import { logout } from "../../actions/logout";
import Cart from "../../components/Cart";

const Search = dynamic(() => import("../../components/Search"), { ssr: false });

const MainNavbarDesktop = ({ session }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isAuthenticated = !!session?.user;
  const isAdmin =
    session?.user?.role === "admin" || session?.user?.role === "superadmin";

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const Logout = () => {
    logout();
  };

  return (
    <Box
      justifyContent="space-between"
      width="100%"
      alignItems="center"
      sx={{ display: { xs: "none", md: "flex" } }}
    >
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Link href="/">
          <Image
            src={"/images/texcoco_logo2.svg"}
            alt="ferreteria texcoco"
            width="120"
            height="90"
          />
        </Link>
      </Box>
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Search />
      </Box>
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton color="grey.main" onClick={handlePopoverOpen}>
          <Person />
        </IconButton>
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <Stack sx={{ p: 2 }}>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Button href="/admin/add-product" fullWidth sx={{ mb: 1 }}>
                    Ir al panel
                  </Button>
                )}
                {!isAdmin && (
                  <>
                    <Button href="/favorites" sx={{ mb: 1 }}>
                      Lista de favoritos
                    </Button>
                    <Button href="/history" sx={{ mb: 1 }}>
                      Historial de órdenes
                    </Button>
                  </>
                )}
                <Button
                  onClick={Logout}
                  color="error"
                  fullWidth
                  variant="outlined"
                >
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Typography fontWeight={700} variant="body1" sx={{ mb: 1 }}>
                  Accede o crea una cuenta
                </Typography>
                <Button variant="contained" href="/auth/login" fullWidth>
                  Iniciar sesión
                </Button>
                <Button
                  variant="outlined"
                  href="/auth/signup"
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Crear una cuenta
                </Button>
              </>
            )}
          </Stack>
        </Popover>
        {!isAdmin && <Cart />}
      </Box>
    </Box>
  );
};

const MainNavbarMobile = ({ session }) => {
  const [openNavbar, setOpenNavbar] = useState(false);
  const isAuthenticated = !!session?.user;
  const isAdmin =
    session?.user?.role === "admin" || session?.user?.role === "superadmin";

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setOpenNavbar(open);
  };

  const showSections = () => {
    if (!isAuthenticated) return noAuthSectionsMobile;

    if (isAdmin) {
      return adminSectionsMobile;
    } else {
      return userSectionsMobile;
    }
  };

  return (
    <Box
      width="100%"
      justifyContent="space-between"
      alignItems="center"
      sx={{ display: { xs: "flex", md: "none" } }}
    >
      <Link href="/">
        <Image
          src={"/images/texcoco_logo2.svg"}
          alt="ferreteria texcoco"
          width="90"
          height="60"
        />
      </Link>

      <Box display="flex" alignItems="center" gap={1}>
        <Search />
        {!isAdmin && <Cart />}
        <IconButton
          size="large"
          edge="start"
          aria-label="menu"
          onClick={toggleDrawer(true)}
          color="primary"
        >
          <Menu />
        </IconButton>
      </Box>

      <Drawer anchor="top" open={openNavbar} onClose={toggleDrawer(false)}>
        <BurgerMenu
          src={"/images/texcoco_logo2.svg"}
          toggleDrawer={toggleDrawer}
          sections={showSections()}
          showLogout={isAuthenticated}
        />
      </Drawer>
    </Box>
  );
};

export const MainNavbar = ({ ToolbarProps }) => {
  const { data: session } = useSession();

  return (
    <AppBar sx={{ justifyContent: "center" }}>
      <Toolbar sx={ToolbarProps}>
        <MainNavbarDesktop session={session} />
        <MainNavbarMobile session={session} />
      </Toolbar>
    </AppBar>
  );
};

import { Inter } from "next/font/google";
import "./globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import Providers from "../providers/providers";
import { auth } from "../auth";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ferretería Texcoco",
  description: "Ferretería Texcoco",
  icons: {
    icon: '/iso_texcoco.svg'
  }
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={inter.className}>
          <AppRouterCacheProvider>
            <Providers>{children}</Providers>
          </AppRouterCacheProvider>
        </body>
      </html>
    </SessionProvider>
  );
}

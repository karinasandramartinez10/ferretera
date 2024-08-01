import { MainLayout } from "../../layouts/main/MainLayout";

export const metadata = {
  title: "Home",
  description: "Home",
};

export default function Layout({ children }) {
  return (
    <MainLayout
      AppBarProps={{
        height: { xs: "54px", md: "64px" },
      }}
      ToolbarProps={{
        height: { xs: "54px", md: "64px" },
        minHeight: { xs: "54px", md: "64px" },
      }}
    >
      {children}
    </MainLayout>
  );
}

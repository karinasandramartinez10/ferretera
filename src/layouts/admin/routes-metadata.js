export const PAGE_METADATA = {
  "/admin/products": {
    title: "Productos",
    subtitle:
      "Revisa y edita los productos agregados. Puedes actualizar nombre, código, especificaciones o cambiar su imagen.",
  },
  "/admin/add-product": {
    title: "Productos",
    subtitle:
      "Agrega varios productos a la vez. Todos compartirán la misma marca, categoría, subcategoría y subtipo.",
  },
  "/admin/quotes": {
    title: "Todas las cotizaciones",
    subtitle:
      "Visualiza todas las órdenes de cotización enviadas por los clientes. Consulta los detalles, productos y datos de contacto.",
  },
  "/admin/brands": {
    title: "Marcas",
    subtitle: "Gestiona las marcas disponibles en la tienda. Puedes crear nuevas o editar las existentes"
  },
  "/admin/categories": {
    title: "Categorías",
    subtitle: "Crea y actualiza las categorías disponibles para organizar tus productos."
  },
  "/admin/subcategories": {
    title: "Subcategorías",
    subtitle: "Asocia subcategorías a una categoría principal y edítalas cuando sea necesario."
  },
  "/admin/product-type": {
    title: "Tipos de Producto",
    subtitle: "Añade detalles como acabados, colores u otras variantes. Los tipos son opcionales."
  }
};

export const getPageMetadata = (pathname) => {
  if (pathname.startsWith("/admin/quotes/")) {
    return {
      title: "Detalles de la cotización",
      subtitle:
        "Revisa y da seguimiento a la solicitud del cliente. Usa los botones de contacto y marca la cotización como leída una vez atendida.",
    };
  }

  return PAGE_METADATA[pathname] || { title: "", subtitle: "" };
};

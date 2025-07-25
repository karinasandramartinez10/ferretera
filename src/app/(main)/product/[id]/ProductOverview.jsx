import { Typography } from "@mui/material";

export const ProductOverview = ({ brand, name, code }) => (
  <>
    <Typography variant="body2" color="primary.main">
      {brand}
    </Typography>
    <Typography variant="h4">{name}</Typography>
    <Typography variant="body2" color="textSecondary" gutterBottom>
      SKU {code}
    </Typography>
  </>
);

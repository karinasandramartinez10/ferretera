import { Card } from "@mui/material";
import { CldImage } from "next-cloudinary";

const WIDTH = 175;
const HEIGHT = 120;

export const BannerCard = ({
  publicId,
  onClick,
  alt = "brand-card",
  index
}) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        width: WIDTH,
        height: HEIGHT,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        backgroundColor: "#fff",
        overflow: "hidden",
        cursor: "pointer",
        borderRadius: 2,
      }}
      key={index}
    >
      <CldImage
        src={publicId}
        alt={alt}
        width={WIDTH}
        height={HEIGHT}
        crop="pad"
        quality="auto"
        format="auto"
        priority={index < 6}
        fetchPriority={index < 6 ? "high" : "auto"}
        loading={index < 6 ? "eager" : "lazy"}
        decoding="async"
        style={{
          objectFit: "contain",
          borderRadius: "8px",
          display: "block",
          width: "100%",
          height: "auto",
        }}
        sizes="
            (max-width: 600px) 50vw,
            (max-width: 960px) 33vw,
            (max-width: 1280px) 25vw,
            175px
          "
      />
    </Card>
  );
};

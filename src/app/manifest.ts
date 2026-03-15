import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cross Border",
    short_name: "CrossBorder",
    description: "疎遠になった人と、また話すきっかけを",
    start_url: "/home",
    display: "standalone",
    background_color: "#fdf6f0",
    theme_color: "#f87c6a",
    orientation: "portrait",
    categories: ["social", "lifestyle"],
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

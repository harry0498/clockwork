import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clockwork",
    short_name: "Clockwork",
    description:
      "Freelance time tracking & invoicing. Track hours, manage clients, and send professional invoices.",
    start_url: "/",
    display: "standalone",
    theme_color: "#4f46e5",
    background_color: "#020817",
  };
}

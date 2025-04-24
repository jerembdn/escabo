import type { Metadata } from "next";

export const siteConfig = {
  name: "Escabo",
  description: "Le ladder de la commu M8, imaginé par la truc family!!",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://escabo.jeremybdn.fr",
  ogImage: "/og.jpg",
};

export type OGImageType = "default";

/**
 * Génère l'URL pour l'image OG avec les paramètres fournis
 */
export function getOGImageUrl({
  title,
  description,
  type = "default",
}: {
  title: string;
  description: string;
  type?: OGImageType;
}): string {
  const params = new URLSearchParams();

  params.append("title", title);
  params.append("description", description);
  params.append("type", type);

  return `${siteConfig.url}/api/og?${params.toString()}`;
}

/**
 * Construit l'ensemble des métadonnées pour une page
 */
export function constructMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  ogType = "website",
  ogImage,
  ogImageType = "default",
  noIndex = false,
  canonical,
}: {
  title?: string;
  description?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  ogImageType?: OGImageType;
  noIndex?: boolean;
  canonical?: string;
} = {}): Metadata {
  const formattedTitle =
    title === siteConfig.name ? title : `${title} | ${siteConfig.name}`;

  const finalOgImage =
    ogImage ||
    getOGImageUrl({
      title,
      description,
      type: ogImageType,
    });

  return {
    title: formattedTitle,
    description,

    metadataBase: new URL(siteConfig.url),

    ...(canonical && {
      alternates: {
        canonical,
      },
    }),

    authors: [{ name: "Jérémy Baudrin", url: "https://jeremybdn.fr" }],
    creator: "Jérémy Baudrin",
    publisher: "Jérémy Baudrin",

    openGraph: {
      type: ogType,
      locale: "fr_FR",
      url: canonical || siteConfig.url,
      title: formattedTitle,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: finalOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

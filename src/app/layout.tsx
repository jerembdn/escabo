import "kitchn/fonts.css";
import Layout from "@/components/layout";
import ClientProvider from "@/components/layout/client-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ClientProvider>
          <Layout>{children}</Layout>
        </ClientProvider>
      </body>

      <Analytics />
      <SpeedInsights />
    </html>
  );
}

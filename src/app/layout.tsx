import "kitchn/fonts.css";
import Layout from "@/components/layout";
import ClientProvider from "@/components/layout/client-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { KitchnRegistry } from "kitchn/next";
import { KitchnProvider } from "kitchn";

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <KitchnRegistry>
          <KitchnProvider>
            <ClientProvider>
              <Layout>{children}</Layout>
            </ClientProvider>
          </KitchnProvider>
        </KitchnRegistry>
      </body>

      <Analytics />
      <SpeedInsights />
    </html>
  );
}

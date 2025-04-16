import { KitchnProvider } from "kitchn";
import { KitchnRegistry } from "kitchn/next";

import "kitchn/fonts.css";
import Layout from "@/components/layout";
import Footer from "@/components/layout/footer";

export default function RootLayout({ children }: React.PropsWithChildren) {
	return (
		<html lang="fr" suppressHydrationWarning>
			<body>
				<KitchnRegistry>
					<KitchnProvider>
						<Layout>
							{children}

							{/* <Footer /> */}
						</Layout>
					</KitchnProvider>
				</KitchnRegistry>
			</body>
		</html>
	);
}

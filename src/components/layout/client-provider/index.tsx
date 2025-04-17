"use client";

import { SWRConfig } from "swr";

const ClientProvider = ({ children }: { children: React.ReactNode }) => {
	return (
		<SWRConfig
			value={{
				refreshInterval: 3000,
				fetcher: (resource, init) =>
					fetch(resource, init).then((res) => res.json()),
			}}
		>
			{children}
		</SWRConfig>
	);
};

export default ClientProvider;

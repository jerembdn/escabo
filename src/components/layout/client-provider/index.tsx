"use client";

import { KitchnProvider } from "kitchn";
import { KitchnRegistry } from "kitchn/next";
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
      <KitchnRegistry>
        <KitchnProvider>{children}</KitchnProvider>
      </KitchnRegistry>
    </SWRConfig>
  );
};

export default ClientProvider;

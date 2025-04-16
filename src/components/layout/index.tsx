"use client";

import kitchn from "kitchn";
import type React from "react";

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => (
	<Wrapper>{children}</Wrapper>
);

const Wrapper = kitchn.main`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
`;

export default Layout;

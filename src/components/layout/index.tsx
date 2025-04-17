"use client";

import kitchn from "kitchn";
import type React from "react";

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => (
	<Wrapper>{children}</Wrapper>
);

const Wrapper = kitchn.main`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 1200px;
  height: 100%;
  min-height: 100vh;
  width: 100%;
  margin: 0 auto;
`;

export default Layout;

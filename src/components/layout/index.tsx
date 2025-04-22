"use client";

import kitchn, { Container } from "kitchn";
import type React from "react";
import Footer from "./footer";

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Wrapper>
    <Container>{children}</Container>

    <Footer />
  </Wrapper>
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

  padding: 0 10px;

  @media (min-width: 1220px) {
    padding: 0;
  }
`;

export default Layout;

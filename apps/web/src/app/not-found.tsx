import { Container, Link, Text } from "kitchn";

export default function NotFound() {
  return (
    <Container justify="center" align="center" style={{ height: "100vh" }}>
      <Text size={"extraTitle"} weight={"black"}>
        404 - Page Not Found
      </Text>

      <Text>The page you are looking for does not exist.</Text>

      <Link href={"/"} variant="secondary" marginTop={20}>
        Go back to the homepage
      </Link>
    </Container>
  );
}

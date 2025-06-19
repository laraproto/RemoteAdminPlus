// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface RAPlusConfirmEmailProps {
  validationToken: string;
}

const baseUrl = Bun.env.DOMAIN ?? "http://localhost:5173";

const appName = Bun.env.APP_NAME ?? "RemoteAdminPlus";

export const RAPlusConfirmEmail = ({
  validationToken,
}: RAPlusConfirmEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Confirm your email address</Preview>
      <Container style={container}>
        <Section style={logoContainer}>{appName}</Section>
        <Heading style={h1}>Confirm your email address</Heading>
        <Text style={heroText}>
          Please confirm your email address by clicking the button below
        </Text>

        <Button
          style={button}
          href={`${baseUrl}/auth/confirm-email?token=${validationToken}`}
        >
          Verify Email
        </Button>
      </Container>
    </Body>
  </Html>
);

RAPlusConfirmEmail.PreviewProps = {
  validationToken: "thisisaplaceholder",
} as RAPlusConfirmEmailProps;

export default RAPlusConfirmEmail;

const main = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "0px 20px",
};

const logoContainer = {
  marginTop: "32px",
  fontSize: "32px",
  fontWeight: "500",
  verticalALign: "middle",
};

const h1 = {
  color: "#1d1c1d",
  fontSize: "24px",
  fontWeight: "700",
  margin: "10px 0",
  padding: "0",
  lineHeight: "42px",
};

const heroText = {
  fontSize: "20px",
  lineHeight: "28px",
  marginBottom: "30px",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const text = {
  color: "#000",
  fontSize: "14px",
  lineHeight: "24px",
};

const button = {
  backgroundColor: "#007ee6",
  borderRadius: "4px",
  color: "#fff",
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "210px",
  padding: "14px 7px",
};

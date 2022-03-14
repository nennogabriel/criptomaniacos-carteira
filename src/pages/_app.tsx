import { ChakraProvider } from "@chakra-ui/react";
import theme from "../chakra/theme";
import { SessionProvider } from "next-auth/react";
import HuggyChatScript from "../components/HuggyChatScript";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <ChakraProvider theme={theme}>
      <SessionProvider session={session}>
        <Component {...pageProps} />
        <HuggyChatScript />
      </SessionProvider>
    </ChakraProvider>
  );
}

export default MyApp;

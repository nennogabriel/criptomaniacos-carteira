import { ChakraProvider } from "@chakra-ui/react";
import theme from "../chakra/theme";
// import { Provider } from 'next-auth/client';

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      {/* <Provider session={pageProps.session}> */}
      <Component {...pageProps} />
      {/* </Provider> */}
    </ChakraProvider>
  );
}

export default MyApp;

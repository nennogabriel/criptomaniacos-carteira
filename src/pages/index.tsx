import { Box, Button } from "@chakra-ui/react";
import Head from "next/head";
import React from "react";
import PageHeader from "../components/PageHeader";
import NextLink from "next/link";
import LayoutMaintenance from "../components/LayoutMaintenance";

const HomePage = () => {
  if (true) {
    return <LayoutMaintenance />;
  }
  return (
    <>
      <Head>
        <title>Criptomaniacos: app Carteira recomendada</title>
      </Head>
      <Box m="0 auto" maxW="90%" w="1200px">
        <PageHeader />
        <NextLink href="/carteira-alt-factor">
          <Button as="a" type="button">
            Carteira Alt Factor
          </Button>
        </NextLink>
      </Box>
    </>
  );
};

export default HomePage;

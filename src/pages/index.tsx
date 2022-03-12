import { Box, Button } from "@chakra-ui/react";
import Head from "next/head";
import React from "react";
import PageHeader from "../components/PageHeader";
import NextLink from "next/link";

const HomePage = () => {
  return (
    <>
      <Head>
        <title>Criptomaniacos: app Carteira recomendada</title>
      </Head>
      <Box m="0 auto" maxW="90%" w="1200px">
        <PageHeader />
        <NextLink href="/carteira-recomendada">
          <Button as="a" type="button">
            Carteira recomendada
          </Button>
        </NextLink>
      </Box>
    </>
  );
};

export default HomePage;

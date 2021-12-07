import { Box, Text } from "@chakra-ui/layout";

import { Button } from "@chakra-ui/react";
import Head from "next/head";
import React from "react";
import NextLink from "next/link";
import PageHeader from "../components/PageHeader";

export default function Home() {
  return (
    <>
      <Head>
        <title>Carteira Recomendada - Criptomaníacos</title>
        <meta name="description" content="Created by nennogabriel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box m="0 auto" maxW="90%" w="1200px">
        <PageHeader />
        <Box>
          <p>contrate nosso serviço ou aguarde a autorização para uso.</p>
          <Button
            as="a"
            href="https://criptomaniacos.com.br/carteira-recomendada-acesso-liberado/"
          >
            Contrate!
          </Button>
        </Box>
      </Box>
    </>
  );
}

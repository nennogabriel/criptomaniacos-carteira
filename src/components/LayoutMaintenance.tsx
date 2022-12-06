import { Box, Button, Center, Flex, Text } from "@chakra-ui/react";
import React from "react";
import Head from "next/head";

const LayoutMaintenance: React.FC = () => {
  return (
    <>
      <Head>
        <title>Criptomaniacos: Manutenção</title>
      </Head>

      <Center>
        <Box>
          <Text fontSize="2xl">Site em Manutenção</Text>
          <Text fontSize="lg">Desculpe o transtorno, estamos trabalhando para melhorar a sua experiência.</Text>
        </Box>
      </Center>
    </>
  );
};

export default LayoutMaintenance;

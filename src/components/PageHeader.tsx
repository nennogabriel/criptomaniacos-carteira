import { Box, Button, Flex, Text } from "@chakra-ui/react";
import React from "react";
import AuthHeader from "./AuthHeader";
import NextLink from "next/link";

const PageHeader: React.FC = () => {
  return (
    <Box>
      <Flex justify="space-between">
        <NextLink href="/">
          <Button as="a" variant="ghost">
            <Text>Criptomaníacos</Text>
          </Button>
        </NextLink>
        <AuthHeader />
      </Flex>
    </Box>
  );
};

export default PageHeader;

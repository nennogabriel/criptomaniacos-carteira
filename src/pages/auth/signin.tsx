import { Box, Button, Center } from "@chakra-ui/react";
import { getProviders, signIn } from "next-auth/react";
import PageHeader from "../../components/PageHeader";
import TelegramLoginButton from "../../components/TelegramLoginButton";

export default function SignIn({ providers }: any) {
  return (
    <Box m="0 auto" maxW="90%" w="1200px">
      <PageHeader />
      <Center>
        {Object.values(providers).map((provider: any) => {
          if (provider.id === "credentials") {
            return (
              <Box key={provider.id}>
                <TelegramLoginButton
                  widgetVersion="16"
                  botName="criptomaniacos_carteira_bot"
                  dataOnauth={(result: any) => {
                    signIn(provider.id, undefined, result);
                  }}
                />
              </Box>
            );
          }

          return (
            <Box key={provider.id}>
              <Button onClick={() => signIn(provider.id)}>
                Entrar com {provider.name}
              </Button>
            </Box>
          );
        })}
      </Center>
    </Box>
  );
}

// This is the recommended way for Next.js 9.3 or newer
export async function getServerSideProps(context: any) {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}

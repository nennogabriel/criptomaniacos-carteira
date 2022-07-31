import { Box, Button, Center } from '@chakra-ui/react';
import { Session } from 'next-auth';
import { getProviders, getSession, signIn } from 'next-auth/react';
import PageHeader from '../../components/PageHeader';
import TelegramLoginButton from '../../components/TelegramLoginButton';

interface SessionProps extends Session {
  role: number;
}

export default function SignIn({ providers }: any) {
  // const session = useSession();

  // console.log("session", session);

  return (
    <Box m="0 auto" maxW="90%" w="1200px">
      <PageHeader />
      <Center>
        {Object.values(providers).map((provider: any) => {
          if (provider.id === 'credentials') {
            return (
              <Box key={provider.id}>
                <TelegramLoginButton
                  dataOnauth={(result: any) => {
                    signIn(provider.id, undefined, result);
                  }}
                  requestAccess={undefined}
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
  const session = (await getSession(context)) as SessionProps;
  // redirect to home if already logged in
  if (session?.role > 0) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  const providers = await getProviders();
  return {
    props: { providers },
  };
}

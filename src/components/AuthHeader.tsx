import { Box, Button } from "@chakra-ui/react";
import React from "react";

import { useSession, signIn, signOut } from "next-auth/react";

const AuthHeader: React.FC = () => {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session.user.name} {session.role}
        <br />
        <Button onClick={() => signOut({ callbackUrl: "/" })}>Sign out</Button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <Button onClick={() => signIn()}>Sign in</Button>
    </>
  );
};

export default AuthHeader;

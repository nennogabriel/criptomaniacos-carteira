import { Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import { getSession, signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { api } from "../services/api";

const CarteiraAdminPage = () => {
  const session = useSession();
  const [assets, setAssets] = useState([]);
  const [originAssets, setOriginAssets] = useState([]);
  const [newAsset, setNewAsset] = useState("");
  const [updated, setUpdated] = useState(false);

  function handleRemoveAsset(asset) {
    setAssets(assets.filter((a) => a !== asset));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const addNewAsset = newAsset.toUpperCase().trim();
    if (!assets.find((a) => a == addNewAsset)) {
      setAssets([...assets, addNewAsset].sort());
    }
    setNewAsset("");
  }

  async function handleUpdate() {
    if (assets.length === 10) {
      const response = await api.post("/fauna/wallet", { assets });
      setOriginAssets([...assets]);
    } else {
      alert("somente enviar com 10 ativos");
    }
  }

  useEffect(() => {
    async function loadData() {
      const response = await api.get("/fauna/wallet");

      setAssets(response.data.assets.sort());
      setOriginAssets(response.data.assets.sort());
      setUpdated(true);
    }
    loadData();
  }, []);

  useEffect(() => {
    setUpdated(String(originAssets) == String(assets) || assets.length !== 10);
  }, [assets, originAssets]);

  if (session.status === "loading") {
    return <p>Loading...</p>;
  }

  if (session.status === "unauthenticated") {
    signIn();
    return <p>Access Denied</p>;
  }

  return (
    <>
      <Head>
        <title>Criptomaniacos: admin page</title>
      </Head>
      <Box m="0 auto" maxW="90%" w="1200px">
        <PageHeader />
        <Flex mb={4}>
          {assets.map((asset) => (
            <Flex align="center" justify="center" key={asset} mr={4}>
              <Text>{asset}</Text>
              <Button size="sm" onClick={() => handleRemoveAsset(asset)}>
                -
              </Button>
            </Flex>
          ))}
        </Flex>

        <form onSubmit={handleSubmit}>
          <Flex>
            <Input
              name="newAsset"
              value={newAsset}
              onChange={(e) => setNewAsset(e.target.value)}
              placeholder="Novo Ativo"
            />
            <Button type="submit">Add</Button>
          </Flex>
        </form>

        <Box mt={8}>
          <Text>Ativos: {assets.length}</Text>

          <Button
            type="button"
            onClick={handleUpdate}
            mt={2}
            disabled={updated}
          >
            update
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default CarteiraAdminPage;

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (session?.status < 2) {
    return {
      redirect: {
        destination: "/contrate",
        permanent: false,
      },
    };
  }
}

import { Box } from "@chakra-ui/layout";

import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  Text,
  Editable,
  EditableInput,
  EditablePreview,
  ButtonGroup,
  Button,
  Input,
  Flex,
  useEditableControls,
  IconButton,
} from "@chakra-ui/react";
import axios from "axios";
import { getSession, signIn, useSession } from "next-auth/react";
import Head from "next/head";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { FaEdit, FaWindowClose, FaCheckSquare } from "react-icons/fa";
import PageHeader from "../components/PageHeader";
import { api } from "../services/api";

interface AssetsProps {
  ticker: string;
  qtd: number;
  weight: number;
}

export default function CarteiraRecomendada({ binancePrices }) {
  const session = useSession();
  const [wallet, setWallet] = useState<Array<AssetsProps>>([]);
  const [assets, setAssets] = useState([]);
  const [lastUpdate, setLastUpdate] = useState("LOADING");
  const [saved, setSaved] = useState(true);

  const [quote, setQuote] = useState("USDT");
  const [balanceType, setBalanceType] = useState("TOKEN");
  const [cash, setCash] = useState(0);

  const [portifolioList, setPortifolioList] = useState([]);

  const portifolioSum = useMemo(() => {
    const data =
      portifolioList.length > 0
        ? {
            USDT:
              portifolioList
                .map((item) => item.quote.USDT)
                .reduce((acc, item) => acc + item) + cash,
            BTC:
              portifolioList
                .map((item) => item.quote.BTC)
                .reduce((acc, item) => acc + item) +
              cash / binancePrices["BTCUSDT"],
            weight: portifolioList
              .map((item) => item.weight)
              .reduce((acc, item) => acc + item),
          }
        : {
            USDT: 0,
            BTC: 0,
            weight: 0,
          };
    return data;
  }, [binancePrices, cash, portifolioList]);

  const today = new Date().toISOString().split("T")[0];

  const updateAndCalculatePortifolio = useCallback(() => {
    const data = wallet.map((item) => {
      const { ticker, qtd, weight } = item;
      const quotes = Object.keys(binancePrices)
        .filter((item) => item.startsWith(ticker))
        .map((item) => item.replace(ticker, ""));
      const quote = {
        BTC: binancePrices[`${ticker}BTC`] * qtd,
        USDT:
          (binancePrices[`${ticker}USDT`] ||
            binancePrices[`${ticker}BTC`] * binancePrices[`BTCUSDT`]) * qtd,
      };
      const quoteShow = {
        BTC: quote.BTC.toFixed(8),
        USDT: quote.USDT.toFixed(3),
      };
      const hasUSDT = quotes.some((item) => item === "USDT");
      const percent = {
        ideal: weight / portifolioSum.weight,
        actual: quote.USDT / portifolioSum.USDT,
      };

      const action = {
        min: Math.abs(percent.ideal - percent.actual) * portifolioSum.USDT > 10,
        text: percent.ideal > percent.actual ? "Comprar" : "Vender",
        quote: {
          USDT: (
            Math.abs(percent.ideal - percent.actual) * portifolioSum.USDT
          ).toFixed(2),
          BTC: (
            Math.abs(percent.ideal - percent.actual) * portifolioSum.BTC
          ).toFixed(8),
          TOKEN: (
            (Math.abs(percent.ideal - percent.actual) * portifolioSum.USDT) /
            (binancePrices[`${ticker}USDT`] ||
              binancePrices[`${ticker}BTC`] * binancePrices[`BTCUSDT`])
          ).toFixed(5),
        },
      };
      return { ...item, quote, quoteShow, hasUSDT, percent, action };
    });

    setPortifolioList(data);
  }, [binancePrices, portifolioSum, wallet]);

  const saveData = useCallback(() => {
    localStorage.setItem(
      "carteira-recomendada",
      JSON.stringify({ wallet, assets, lastUpdate })
    );
    setSaved(true);
  }, [assets, lastUpdate, wallet]);

  const loadLastWalletData = useCallback(async () => {
    if (lastUpdate !== today) {
      const response = await api.get("/fauna/wallet");
      setAssets(response.data.assets);
      setLastUpdate(today);
    }
  }, [lastUpdate, today]);

  const updateLastWalletData = useCallback(() => {
    const updatedWallet = assets.map((asset) => {
      const hasInWallet = wallet.filter((item) => item.ticker === asset);

      return hasInWallet.length > 0
        ? hasInWallet[0]
        : {
            ticker: asset,
            qtd: 0,
            weight: 10,
          };
    });
    setWallet(updatedWallet.sort());
  }, [assets, wallet]);

  const calculateAndShow = useCallback(
    (e) => {
      e.preventDefault();
      updateAndCalculatePortifolio();
    },
    [updateAndCalculatePortifolio]
  );

  function handleQtdEditableSubmit(item, newData) {
    const updateWallet = wallet.map((c) => ({
      ...c,
      qtd: c.ticker === item.ticker ? newData : c.qtd,
    }));
    setWallet(updateWallet.sort());
  }

  function EditableControls() {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps,
      getEditButtonProps,
    } = useEditableControls();

    return isEditing ? (
      <ButtonGroup justifyContent="center" size="sm">
        <IconButton
          icon={<FaCheckSquare />}
          {...getSubmitButtonProps()}
          aria-label="Check Button"
        />
        <IconButton
          icon={<FaWindowClose />}
          {...getCancelButtonProps()}
          aria-label="Close Button"
        />
      </ButtonGroup>
    ) : (
      <Flex justifyContent="center">
        <IconButton
          size="sm"
          icon={<FaEdit />}
          {...getEditButtonProps()}
          aria-label="Edit Button"
        />
      </Flex>
    );
  }

  useEffect(() => {
    const localData = JSON.parse(localStorage.getItem("carteira-recomendada"));
    if (!!localData) {
      setAssets(localData.assets.sort());
      setWallet(localData.wallet.sort());
      setLastUpdate(localData.lastUpdate);
      updateAndCalculatePortifolio();
    }
  }, []);

  useEffect(() => {
    const localStorageString = localStorage.getItem("carteira-recomendada");
    const isEqual =
      localStorageString == JSON.stringify({ wallet, assets, lastUpdate });
    setSaved(isEqual);
  }, [assets, lastUpdate, wallet]);

  useEffect(() => {}, []);

  function handleOnChangeCaixaInput(e) {
    if (e.target.value !== 0 && String(e.target.value)[0] === "0") {
      setCash(e.target.value[1]);
      return;
    }
    setCash(Number(e.target.value));
  }

  if (session.status === "loading") {
    return <p>Loading...</p>;
  }

  if (session.status === "unauthenticated") {
    signIn();
    return <p>Access Denied</p>;
  }

  return (
    <div>
      <Head>
        <title>APP: Carteira Recomendada - Criptomaníacos</title>
        <meta name="description" content="Created by nennogabriel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box m="0 auto" maxW="90%" w="1200px">
        <PageHeader />
        <Box>
          <Flex>
            <ButtonGroup size="sm" isAttached variant="outline" mr={8}>
              <Button
                mr="-px"
                colorScheme={quote === "USDT" ? "green" : "gray"}
                onClick={() => setQuote("USDT")}
              >
                USDT
              </Button>
              <Button
                mr="-px"
                colorScheme={quote === "BTC" ? "yellow" : "gray"}
                onClick={() => setQuote("BTC")}
              >
                BTC
              </Button>
            </ButtonGroup>

            <ButtonGroup size="sm" isAttached variant="outline">
              <Button
                mr="-px"
                colorScheme="gray"
                onClick={loadLastWalletData}
                disabled={lastUpdate === today}
              >
                Carregar Carteira
              </Button>
              <Button
                mr="-px"
                colorScheme="gray"
                onClick={updateLastWalletData}
                disabled={wallet.length === 10}
              >
                Registrar Carteira
              </Button>

              <Button
                mr="-px"
                colorScheme="gray"
                onClick={saveData}
                disabled={saved}
              >
                Salvar
              </Button>
              <Button
                mr="-px"
                colorScheme="gray"
                onClick={() => localStorage.removeItem("carteira-recomendada")}
              >
                Clear Cache
              </Button>
            </ButtonGroup>
          </Flex>
          <form onSubmit={calculateAndShow}>
            <Flex mt={4} align="center">
              <Text mr={4}>Caixa (USDT):</Text>
              <Input
                type="number"
                value={cash}
                onChange={handleOnChangeCaixaInput}
                w={40}
                mr={4}
              />
              <Button type="submit">Carregar / Atualizar</Button>
            </Flex>
          </form>

          <Table>
            <TableCaption>Carteira Criptomaniacos</TableCaption>
            <Thead>
              <Tr>
                <Th>Crypto</Th>
                <Th>Quantidade</Th>
                <Th>Saldo em {quote}</Th>
                <Th>Porcentagem</Th>
                <Th>
                  Rebalancear
                  <br />
                  <ButtonGroup size="sm" isAttached variant="outline">
                    <Button
                      mr="-px"
                      colorScheme={balanceType === "TOKEN" ? "purple" : "gray"}
                      onClick={() => setBalanceType("TOKEN")}
                    >
                      TOKEN
                    </Button>
                    <Button
                      mr="-px"
                      colorScheme={
                        balanceType === "BASE"
                          ? quote === "USDT"
                            ? "green"
                            : "yellow"
                          : "gray"
                      }
                      onClick={() => setBalanceType("BASE")}
                    >
                      {quote}
                    </Button>
                  </ButtonGroup>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {portifolioList.map((c) => (
                <Tr key={c.ticker}>
                  <Td>{c.ticker}</Td>
                  <Td>
                    <Editable
                      defaultValue={Number(c.qtd).toString()}
                      onChange={(data) => (data == "" ? 0 : data)}
                      onSubmit={(newData) =>
                        handleQtdEditableSubmit(c, newData)
                      }
                      display="flex"
                      justifyContent="space-around"
                    >
                      <EditablePreview />
                      <Input type="number" as={EditableInput} />
                      <EditableControls />
                    </Editable>
                  </Td>
                  <Td>{c.quoteShow[quote]}</Td>
                  <Td>
                    {c.percent.actual.toFixed(1) !== "NaN" ? (
                      <>
                        <Text mr={4}>
                          {(c.percent.actual * 100).toFixed(1)}%
                        </Text>
                        {c.percent.actual === 10 ? (
                          ""
                        ) : (
                          <Text
                            as="span"
                            color={
                              c.percent.actual * 100 - 10 >= 0 ? "green" : "red"
                            }
                          >
                            ({(c.percent.actual * 100 - 10).toFixed(1)}%)
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text>-</Text>
                    )}
                  </Td>

                  <Td>
                    {c.action.min ? (
                      <>
                        <p>
                          {balanceType === "TOKEN"
                            ? `${c.action.text} 
                        ${c.action.quote.TOKEN} ${c.ticker}`
                            : `${c.action.text}
                        ${c.action.quote[quote]} ${quote}`}
                        </p>
                      </>
                    ) : (
                      "-"
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
            <Tfoot>
              <Tr>
                <Td>Total:</Td>
                <Td> - </Td>
                <Td> {portifolioSum[quote]} </Td>
                <Td> - </Td>
                <Td> </Td>
              </Tr>
            </Tfoot>
          </Table>
        </Box>
      </Box>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (session?.status === 0) {
    return {
      redirect: {
        destination: "/contrate",
        permanent: false,
      },
    };
  }

  const response = await axios.get(
    `${process.env.APP_HOST}/api/binance/getPrices`
  );
  const binancePrices = response.data;
  return {
    props: { binancePrices },
  };
}

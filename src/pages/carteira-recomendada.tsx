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
  qtd: string;
  weight: number;
}

function keepItNumberAboveZero(n: string) {
  if (Number(n) < 0) {
    return "0";
  } else {
    return n.replace(/^0+/, "") || "0";
  }
}

export default function CarteiraRecomendada({ binancePrices }) {
  const session = useSession();
  const [wallet, setWallet] = useState<Array<AssetsProps>>([]);
  const [assets, setAssets] = useState([]);
  const [lastUpdate, setLastUpdate] = useState("");

  const [quote, setQuote] = useState("USDT");
  const [balanceType, setBalanceType] = useState("TOKEN");
  const [cash, setCash] = useState("0");

  const [portfolioAction, setPortfolioAction] = useState([]);
  const [portfolioChanged, setPortfolioChanged] = useState(false);

  const walletAssets = useMemo(() => {
    const data = wallet.map((item) => item.ticker);
    return data.sort();
  }, [wallet]);

  const assetsMissingWallet = useMemo(() => {
    const data = assets.filter(
      (asset) => !walletAssets.some((walletAsset) => walletAsset === asset)
    );
    return data;
  }, [assets, walletAssets]);

  const portfolioAssets = useMemo(() => {
    const data = wallet.map((item) => {
      const { ticker, qtd } = item;
      const quotes = Object.keys(binancePrices)
        .filter((item) => item.startsWith(ticker))
        .map((item) => item.replace(ticker, ""));
      const quote = {
        BTC: binancePrices[`${ticker}BTC`] * Number(qtd),
        USDT:
          (binancePrices[`${ticker}USDT`] ||
            binancePrices[`${ticker}BTC`] * binancePrices[`BTCUSDT`]) *
          Number(qtd),
      };
      const quoteShow = {
        BTC: quote.BTC.toFixed(8),
        USDT: quote.USDT.toFixed(3),
      };
      const hasUSDT = quotes.some((item) => item === "USDT");

      return { ...item, quote, quoteShow, hasUSDT };
    });

    return data;
  }, [binancePrices, wallet]);

  const portfolioSum = useMemo(() => {
    const data =
      portfolioAssets.length > 0
        ? {
            USDT:
              portfolioAssets
                .map((item) => item.quote.USDT)
                .reduce((acc, item) => acc + item) + Number(cash),
            BTC:
              portfolioAssets
                .map((item) => item.quote.BTC)
                .reduce((acc, item) => acc + item) +
              Number(cash) / binancePrices["BTCUSDT"],
            weight: portfolioAssets
              .map((item) => item.weight)
              .reduce((acc, item) => acc + item),
          }
        : {
            USDT: 0,
            BTC: 0,
            weight: 0,
          };
    return data;
  }, [binancePrices, cash, portfolioAssets]);

  const updateAndCalculatePortfolio = useCallback(() => {
    const data = wallet.map((item) => {
      const { ticker, qtd, weight } = item;
      const quote = {
        BTC: binancePrices[`${ticker}BTC`] * Number(qtd),
        USDT:
          (binancePrices[`${ticker}USDT`] ||
            binancePrices[`${ticker}BTC`] * binancePrices[`BTCUSDT`]) *
          Number(qtd),
      };
      const percent = {
        ideal: weight / portfolioSum.weight,
        actual: quote.USDT / portfolioSum.USDT,
      };

      const action = {
        min: Math.abs(percent.ideal - percent.actual) * portfolioSum.USDT > 10,
        text: percent.ideal > percent.actual ? "Comprar" : "Vender",
        quote: {
          USDT: (
            Math.abs(percent.ideal - percent.actual) * portfolioSum.USDT
          ).toFixed(2),
          BTC: (
            Math.abs(percent.ideal - percent.actual) * portfolioSum.BTC
          ).toFixed(8),
          TOKEN: (
            (Math.abs(percent.ideal - percent.actual) * portfolioSum.USDT) /
            (binancePrices[`${ticker}USDT`] ||
              binancePrices[`${ticker}BTC`] * binancePrices[`BTCUSDT`])
          ).toFixed(5),
        },
      };
      return { ...item, percent, action };
    });

    setPortfolioAction(data);
  }, [binancePrices, portfolioSum, wallet]);

  const saveData = useCallback(() => {
    localStorage.setItem("carteira-recomendada", JSON.stringify({ wallet }));
  }, [wallet]);

  const updateLastWalletData = useCallback(() => {
    const updatedWallet = assets.map((asset) => {
      const hasInWallet = wallet.filter((item) => item.ticker === asset);

      return hasInWallet.length > 0
        ? hasInWallet[0]
        : {
            ticker: asset,
            qtd: "0",
            weight: 10,
          };
    });
    setWallet(updatedWallet.sort());
  }, [assets, wallet]);

  const calculateAndShow = useCallback(
    (e) => {
      e.preventDefault();
      updateAndCalculatePortfolio();
      setPortfolioChanged(false);
      saveData();
    },
    [saveData, updateAndCalculatePortfolio]
  );

  function handleQtdEditableSubmit(item, newData) {
    const updateWallet = wallet.map((c) => ({
      ...c,
      qtd: c.ticker === item.ticker ? keepItNumberAboveZero(newData) : c.qtd,
    }));
    setWallet(updateWallet.sort());
    setPortfolioChanged(true);
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
      setWallet(localData.wallet.sort());
    }
    async function loadAssets() {
      const response = await api.get("/fauna/wallet");
      setAssets(response.data.assets.sort());
    }
    loadAssets();
  }, []);

  function handleOnChangeCaixaInput(e) {
    setCash(keepItNumberAboveZero(e.target.value));
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
                colorScheme={quote === "USDT" ? "green" : "gray"}
                onClick={() => setQuote("USDT")}
              >
                USDT
              </Button>
              <Button
                colorScheme={quote === "BTC" ? "yellow" : "gray"}
                onClick={() => setQuote("BTC")}
              >
                BTC
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

          {portfolioChanged && (
            <Text py={4}>
              Dados devem ser recalculados, favor clicar no botão acima para
              atualizar.
            </Text>
          )}

          {assetsMissingWallet.length > 0 && (
            <Flex align="center" my={4}>
              <Text>
                Ativos para entrar na carteira:{" "}
                {assetsMissingWallet.map((a, i) => (
                  <Text as="span" key={a} mr={2}>
                    {a}
                    {i + 1 !== assetsMissingWallet.length && ","}
                  </Text>
                ))}
              </Text>
              <Button
                colorScheme="gray"
                onClick={updateLastWalletData}
                disabled={
                  JSON.stringify(walletAssets) === JSON.stringify(assets)
                }
              >
                Registrar Ativos na Carteira
              </Button>
            </Flex>
          )}

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
                      colorScheme={balanceType === "TOKEN" ? "purple" : "gray"}
                      onClick={() => setBalanceType("TOKEN")}
                    >
                      TOKEN
                    </Button>
                    <Button
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
              {portfolioAssets.map((c) => {
                const action = portfolioAction.filter(
                  (item) => item.ticker === c.ticker
                )[0];

                return (
                  <Tr key={c.ticker}>
                    <Td>{c.ticker}</Td>
                    <Td>
                      <Editable
                        defaultValue={Number(c.qtd).toString()}
                        onChange={(data) => keepItNumberAboveZero(data)}
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
                    {!action ? (
                      <>
                        <Td> - </Td>
                        <Td> - </Td>
                      </>
                    ) : (
                      <>
                        <Td>
                          {portfolioChanged ? (
                            <Text>-</Text>
                          ) : (
                            <Text>
                              <Text as="span" mr={4}>
                                {(action.percent.actual * 100).toFixed(1)}%
                              </Text>
                              <Text
                                as="span"
                                color={
                                  action.percent.actual * 100 - 10 >= 0
                                    ? "green"
                                    : "red"
                                }
                              >
                                ({(action.percent.actual * 100 - 10).toFixed(1)}
                                %)
                              </Text>
                            </Text>
                          )}
                        </Td>

                        <Td>
                          {action.action.min ? (
                            <>
                              <p>
                                {balanceType === "TOKEN"
                                  ? `${action.action.text} 
                        ${action.action.quote.TOKEN} ${action.ticker}`
                                  : `${action.action.text}
                        ${action.action.quote[quote]} ${quote}`}
                              </p>
                            </>
                          ) : (
                            "-"
                          )}
                        </Td>
                      </>
                    )}
                  </Tr>
                );
              })}
            </Tbody>
            <Tfoot>
              <Tr>
                <Td>Total:</Td>
                <Td> - </Td>
                <Td>{portfolioSum[quote].toFixed(quote === "USDT" ? 2 : 6)}</Td>
                <Td> - </Td>
                <Td> - </Td>
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

  if (session?.role < 2) {
    return {
      redirect: {
        destination: "/contrate",
        permanent: false,
      },
    };
  }

  let response = {
    data: [],
  };

  try {
    response = await api.get(`/binance/getPrices`);
  } catch (err) {
    response = await axios.get(
      `${process.env.NEXTAUTH_URL}/api/binance/getPrices`
    );
  }
  const binancePrices = response.data;
  return {
    props: { binancePrices },
  };
}

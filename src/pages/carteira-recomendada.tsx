import { Box, Text } from "@chakra-ui/layout";

import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  Editable,
  EditableInput,
  EditablePreview,
  ButtonGroup,
  Button,
  Input,
} from "@chakra-ui/react";
import axios from "axios";
import { getSession, signIn, useSession } from "next-auth/react";
import Head from "next/head";
import React, { useCallback, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";

const data = {
  title: "Carteira recomendada",
  assets: [
    { ticker: "FTM", qtd: 0, weight: 10 },
    { ticker: "SAND", qtd: 0, weight: 10 },
    { ticker: "SOL", qtd: 0, weight: 10 },
    { ticker: "SCRT", qtd: 0, weight: 10 },
  ].sort(),
  changes: [],
};

var portifolioSum = {
  USDT: 0,
  BTC: 0,
  weight: 0,
};

export default function CarteiraRecomendada({ binancePrices }) {
  const session = useSession();
  const [cryptos, setCryptos] = useState(data.assets);

  const [quote, setQuote] = useState("USDT");
  const [balanceType, setBalanceType] = useState("TOKEN");
  const [cash, setCash] = useState(0);

  const portifolioList = useMemo(() => {
    const data = cryptos.map((item) => {
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

    return data;
  }, [cryptos, binancePrices, portifolioSum]);

  portifolioSum = useMemo(
    () => ({
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
    }),
    [binancePrices, cash, portifolioList]
  );

  function handleQtdEditableSubmit(crypto, newData) {
    const updateCryptos = cryptos.map((c) => ({
      ...c,
      qtd: c.ticker === crypto.ticker ? newData : c.qtd,
    }));
    setCryptos(updateCryptos);
  }

  const handleActionTicker = useCallback(
    (crypto) => {
      if (crypto.action.text === "Comprar") {
        const index = cryptos.findIndex((c) => c.ticker === crypto.ticker);
        setCryptos(
          cryptos.map((i) =>
            i.ticker === crypto.ticker
              ? { ...i, qtd: i.qtd + Number(crypto.action.quote.TOKEN) }
              : i
          )
        );
        setCash(cash - crypto.action.quote.USDT);
      } else {
        const updateCriptos = [
          ...cryptos.filter((i) => i.ticker !== crypto.ticker),
          {
            ticker: crypto.ticker,
            qtd: crypto.qtd - crypto.action.quote.TOKEN,
            weight: crypto.weight,
          },
        ].sort();
        setCryptos(updateCriptos);
        setCash(cash + crypto.action.quote.USDT);
      }
    },
    [cash, cryptos]
  );

  if (session.status == "unauthenticated") {
    signIn();
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
          <ButtonGroup size="sm" isAttached variant="outline">
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
          <Table>
            <TableCaption>Carteira Criptomaniacos</TableCaption>
            <Thead>
              <Tr>
                <Th>Crypto</Th>
                <Th>Quantidade</Th>
                <Th>Saldo em USDT</Th>
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
                      onSubmit={(newData) =>
                        handleQtdEditableSubmit(c, newData)
                      }
                    >
                      <EditablePreview />
                      <EditableInput />
                    </Editable>
                  </Td>
                  <Td>{c.quoteShow[quote]}</Td>
                  <Td>{(c.percent.actual * 100).toFixed(1)}%</Td>
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
          <Box>
            Caixa:
            <Input
              type="number"
              value={cash}
              onChange={(e) => setCash(Number(e.target.value) || 0)}
            />
          </Box>
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

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
  useEditableControls,
} from "@chakra-ui/react";
import axios from "axios";
import Head from "next/head";
import React, { useMemo, useState } from "react";

export default function Home({ prices }) {
  const [cryptos, setCryptos] = useState([
    ["FTM", 0],
    ["SAND", 0],
    ["SOL", 0],
    ["SCRT", 0],
    ["MANA", 0],
    ["AR", 0],
    ["AVAX", 0],
    ["NEAR", 0],
    ["SHIB", 0],
    ["LRC", 0],
  ]);

  const cryptoInUSDT = useMemo(() => {
    const data = {};
    cryptos.forEach((c) => {
      const decimal = 4;
      data[c[0]] = (
        Math.floor(Number(c[1]) * prices[`${c[0]}USDT`] * 10 ** decimal) /
        10 ** decimal
      ).toFixed(decimal);
      if (data[c[0]] === "NaN") {
        data[c[0]] = (
          Math.floor(
            Number(c[1]) *
              prices[`${c[0]}BTC`] *
              prices[`BTCUSDT`] *
              10 ** decimal
          ) /
          10 ** decimal
        ).toFixed(decimal);
      }

      // if (data[c[0]] === (0).toFixed(decimal)) {
      //   data[c[0]] += " **";
      // }
    });

    return data;
  }, [cryptos, prices]);

  const cryptoSum = useMemo(
    () => cryptos.reduce((a, c) => a + Number(cryptoInUSDT[c[0]]), 0),
    [cryptoInUSDT, cryptos]
  );

  const cryptoPercent = useMemo(() => {
    const data = {};

    cryptos.forEach((c) => {
      data[c[0]] = ((Number(cryptoInUSDT[c[0]]) / cryptoSum) * 100).toFixed(1);
    });
    return data;
  }, [cryptoInUSDT, cryptoSum, cryptos]);

  const cryptoAdjust = useMemo(() => {
    const data = {};
    cryptos.forEach((c) => {
      const ajuste = 10 - Number(cryptoPercent[c[0]]);
      if (ajuste > 0.2) {
        data[c[0]] = `Comprar ${(cryptoSum * ajuste).toFixed(2)} USDT`;
      }
      if (ajuste < -0.2) {
        data[c[0]] = `Vender ${(cryptoSum * Math.abs(ajuste)).toFixed(2)} USDT`;
      }
    });
    return data;
  }, [cryptos, cryptoPercent, cryptoSum]);

  function handleEditableSubmit(crypto, newData) {
    const updateCryptos = cryptos.map((c) =>
      c[0] == crypto[0] ? [[c[0]], newData] : c
    );
    setCryptos(updateCryptos);
  }

  return (
    <div>
      <Head>
        <title>Carteira Recomendada - Criptomaníacos</title>
        <meta name="description" content="Created by nennogabriel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box m="0 auto" maxW="90%" w="1200px">
        <Box>
          <Table>
            <TableCaption>Carteira Criptomaniacos</TableCaption>
            <Thead>
              <Tr>
                <Th>Crypto</Th>
                <Th>Quantidade</Th>
                <Th>Saldo em USDT</Th>
                <Th>Porcentagem</Th>
                <Th>Rebalancear</Th>
              </Tr>
            </Thead>
            <Tbody>
              {cryptos.map((c) => (
                <Tr key={c[0]}>
                  <Td>{c[0]}</Td>
                  <Td>
                    <Editable
                      defaultValue={Number(c[1]).toString()}
                      onSubmit={(newData) => handleEditableSubmit(c, newData)}
                    >
                      <EditablePreview />
                      <EditableInput />
                    </Editable>
                  </Td>
                  <Td>{cryptoInUSDT[c[0]]}</Td>
                  <Td>{cryptoPercent[c[0]]}</Td>
                  <Td>{cryptoAdjust[c[0]]}</Td>
                </Tr>
              ))}
            </Tbody>
            <Tfoot></Tfoot>
          </Table>
        </Box>
      </Box>
    </div>
  );
}

export async function getStaticProps(context) {
  const response = await axios.get(
    `${process.env.SELF_HOST}/api/binance/getPrices`
  );
  const prices = response.data;
  return {
    props: { prices },
  };
}

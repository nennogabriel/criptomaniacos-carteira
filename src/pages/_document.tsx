import NextDocument, { Html, Head, Main, NextScript } from 'next/document';
import HuggyChatScript from '../components/HuggyChatScript';

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="pt-br">
        <Head>
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap"
            rel="stylesheet"
          />

          <meta httpEquiv="Content-Language" content="pt-br"></meta>
          <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        </Head>
        <body>
          <Main />

          <NextScript />
          {process.env.NODE_ENV === 'production' && <HuggyChatScript />}
        </body>
      </Html>
    );
  }
}

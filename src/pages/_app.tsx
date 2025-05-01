import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/images/logo-removebg-preview.png" />
        <title>Elim Christian Garden Int</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
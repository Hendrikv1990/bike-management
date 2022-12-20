import { Html, Head, Main, NextScript } from 'next/document'
import Link from 'next/link'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
      <ul>
          <li>
              <Link href="/">Home</Link>
          </li>
          <li>
              <Link href="/brands">Brands</Link>
          </li>
          <li>
              <Link href="/bikes">Bikes</Link>
          </li>
      </ul>

        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Tipografía: Poppins y Montserrat */}
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Poppins:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Iconos: Google Material Symbols */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        {/* AOS Library */}
        <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
        <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
      </body>
    </Html>
  );
}

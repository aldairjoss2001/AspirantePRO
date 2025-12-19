import { AuthProvider } from '../lib/AuthContext';
import { DarkModeProvider } from '../lib/DarkModeContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default MyApp;

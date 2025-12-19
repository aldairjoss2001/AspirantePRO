import { AuthProvider } from '../lib/AuthContext';
import { DarkModeProvider } from '../lib/DarkModeContext';
import PageTransition from '../components/PageTransition';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <PageTransition>
          <Component {...pageProps} />
        </PageTransition>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default MyApp;

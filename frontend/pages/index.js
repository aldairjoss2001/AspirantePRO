import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página estática index.html en la carpeta public
    window.location.href = '/landing.html';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirigiendo...</p>
    </div>
  );
}

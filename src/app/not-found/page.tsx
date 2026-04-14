import Link from "next/link";


export default function PageNotFound() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>404</h1>
      <h2 style={styles.subtitle}>YUKA</h2>
      <p style={styles.text}>
        Lo sentimos, el subdominio al que intentas acceder no existe o no está registrado en nuestro sistema.
      </p>
      <Link 
      
      href="http://127.0.0.1:3000" style={styles.button}>
        Volver al inicio
      </Link>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center' as const,
    backgroundColor: '#f8f9fa',
    color: '#333',
    padding: '20px',
  },
  title: {
    fontSize: '8rem',
    margin: 0,
    color: '#0070f3',
  },
  subtitle: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  text: {
    fontSize: '1.2rem',
    maxWidth: '500px',
    marginBottom: '2rem',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#0070f3',
    color: 'white',
    borderRadius: '5px',
    textDecoration: 'none',
    fontWeight: 'bold' as const,
  },
};
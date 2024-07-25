import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";


export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      {Component.NavLayout ?
        <Component.NavLayout>
          <Component {...pageProps} />
        </Component.NavLayout> : <Component {...pageProps} />
      }
    </AuthProvider>
  )


}

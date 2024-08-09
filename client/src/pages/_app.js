import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


export default function App({ Component, pageProps }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AuthProvider>
      {Component.NavLayout ?
        <Component.NavLayout>
          <Component {...pageProps} />
        </Component.NavLayout> : <Component {...pageProps} />
      }
    </AuthProvider>
    </LocalizationProvider>
    
  )


}

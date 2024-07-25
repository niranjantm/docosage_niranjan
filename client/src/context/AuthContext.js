import{useState,createContext} from 'react'

const AuthContext = createContext();

export const AuthProvider = ({children})=>{
    const [userAuth,setUserAuth] = useState(null);


    return(
        <AuthContext.Provider value={{userAuth,setUserAuth}}>
            {children}
        </AuthContext.Provider>
    )
}
export default AuthContext



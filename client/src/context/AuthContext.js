import{useState,createContext, useEffect} from 'react'


const AuthContext = createContext();

export const AuthProvider = ({children})=>{
    const [userAuth,setUserAuth] = useState(null)
    const [hydration,setHydration] = useState(false)

    useEffect(()=>{
        if(typeof window !== "undefined"){
            const storedUser = localStorage.getItem("user")

            if(storedUser){
                setUserAuth(JSON.parse(storedUser))
            }
            setHydration(true)
        }
    },[])

    if(!hydration){
        return null
    }

    return(
        <AuthContext.Provider value={{userAuth,setUserAuth}}>
            {children}
        </AuthContext.Provider>
    )
}
export default AuthContext



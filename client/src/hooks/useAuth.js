import { useContext,useEffect } from "react";
import AuthContext from "@/context/AuthContext";

const useAuth = ()=>{
    const {userAuth,setUserAuth} = useContext(AuthContext);
    

    // useEffect(() => {
    //     if (typeof window !== 'undefined') {
    //       const storedUser = localStorage.getItem("user");
    //       if (storedUser) {
    //         setUserAuth(JSON.parse(storedUser));
    //       }
    //     }
    //   }, []);

      return {userAuth,setUserAuth}
}
export default useAuth
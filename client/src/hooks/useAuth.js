import { useContext } from "react";
import AuthContext from "@/context/AuthContext";

const useAuth = ()=>{
    const {userAuth,setUserAuth} = useContext(AuthContext);
    return {userAuth,setUserAuth}
}
export default useAuth
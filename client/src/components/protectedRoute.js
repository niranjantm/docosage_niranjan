import { useEffect } from "react";
import { useRouter } from "next/router";
import useAuth from "@/hooks/useAuth";

const protectedRoutes = (ProtectedPage)=>{
    return (props)=>{
        const {userAuth} = useAuth()
        const router = useRouter()

        useEffect(()=>{
            if(!userAuth){
                router.push("/dashboard/login");
            }
        },[userAuth])

        return userAuth?<ProtectedPage {...props}/>:null;
    }
}

export default protectedRoutes;
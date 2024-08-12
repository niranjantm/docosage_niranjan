import { useEffect } from "react";
import { useRouter } from "next/router";
import useAuth from "@/hooks/useAuth";

const protectedRoutesCustomer = (ProtectedPage)=>{
    return (props)=>{
        const {userAuth} = useAuth()
        const router = useRouter()

        useEffect(()=>{
            console.log(userAuth)
            if(!userAuth){
                // if(userAuth?.account_type!=="customer"){
                //     router.back()
                // }
                router.replace("/")
                
                   
            }
            else if(userAuth?.account_type!=='customer'){
                router.back()
            }
        },[userAuth])
       
        if(!userAuth || userAuth?.account_type!=="customer"){
            return <div>Loading...</div>
        }
        const Page  = userAuth?<ProtectedPage {...props}/>:null;



       if(ProtectedPage.NavLayout){
        return <ProtectedPage.NavLayout>{Page}</ProtectedPage.NavLayout>
    }

    return Page;
    }
}

export default protectedRoutesCustomer;
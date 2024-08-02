import { useEffect } from "react";
import { useRouter } from "next/router";
import useAuth from "@/hooks/useAuth";



const protectedRoutesDoctor=(ProtectedPage)=>{
   return(props)=>{
    const {userAuth,setUserAuth} = useAuth()
    const router = useRouter()

    
    useEffect(()=>{
        console.log(userAuth)
        if(userAuth?.account_type!=="doctor"){
          
            router.replace("/")
               
        }
        else if(userAuth?.account_type!=='doctor'){
            
            router.back()
        }
    },[userAuth])


    if (!userAuth || userAuth?.account_type !== "doctor") {
        return <div>Loading...</div>
      }

    const Page =  userAuth?<ProtectedPage {...props}/>:null;

    if(ProtectedPage.NavLayout){
        return <ProtectedPage.NavLayout>{Page}</ProtectedPage.NavLayout>
    }

    return Page;

   } 
}

export default protectedRoutesDoctor;
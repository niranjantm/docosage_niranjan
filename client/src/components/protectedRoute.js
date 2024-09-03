import { useEffect } from "react";
import { useRouter } from "next/router";
import useAuth from "@/hooks/useAuth";
import Swal from "sweetalert2";

const protectedRoutesCustomer = (ProtectedPage)=>{
    return (props)=>{
        const {userAuth} = useAuth()
        const router = useRouter()

        useEffect(()=>{
            console.log(userAuth)
            if(!userAuth){
                Swal.fire({
                    icon: "error",
                    title: "Unauthorised!",
                    text: "You have to login to access this page",
                    confirmButtonText:"Go Back"
                }).then((result)=>{
                    if(result.isConfirmed){
                        router.replace("/")
                    }
                })
                
                
                   
            }
            else if(userAuth?.account_type!=='customer'){
                Swal.fire({
                    icon: "error",
                    title: "Unauthorised!",
                    text: "You have to login as a customer to access this page",
                    confirmButtonText:"Go Back"
                }).then((result)=>{
                    if(result.isConfirmed){
                        router.back()
                    }
                })
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
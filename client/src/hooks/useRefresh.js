import axios from "@/pages/api/axios"
// import axios from "axios"
import useAuth from "./useAuth"

 const useRefresh=()=>{
  
    const {userAuth,setUserAuth} = useAuth()
    const refresh = async ()=>{
        try{
            const response = await axios.post("refresh/",{},{
                withCredentials:true, headers:{"Content-Type":"application/json"}
            })
            if(response.status===200){
                setUserAuth(pre=>({...pre,["access"]:response.data?.access}))
            }
        }catch(error){
            console.error(error)
        }
       
    }

    return refresh
}

export default useRefresh

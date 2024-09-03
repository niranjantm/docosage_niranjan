import { axiosPrivate } from "@/pages/api/axios";
import { useEffect } from "react";
import useRefresh from "./useRefresh";
import useAuth from "./useAuth";
import { useRouter } from "next/router";



const useAxiosPrivate = ()=>{
    const refresh = useRefresh();
    const {userAuth,setUserAuth} = useAuth();
    const router = useRouter()

    useEffect(()=>{
      
        const requestIntercept = axiosPrivate.interceptors.request.use(
            config=>{
                if(!config.headers['Authorization']){
                    config.headers['Authorization'] = `Bearer ${userAuth?.access}`
                }
                return config;
            },(error)=>Promise.reject(error)
        )

        const responseIntercept = axiosPrivate.interceptors.response.use(
            response=>response,
            async (error)=>{
                const prevRequest = error?.config;
                if(error?.response?.status===401 && !prevRequest.sent){
                    prevRequest.sent = true;
                    try{
                        const newAccessToken = await refresh();
                        prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return axiosPrivate(prevRequest)
                    }
                    catch(refreshError){
                        try {
                            const response = await axiosPrivate.post("logout/")
                            if (response.status === 200) {
                                alert("Session expired, please login again.");
                                localStorage.removeItem("user")
                                setUserAuth(null)
                               
                            }
                        }
                        catch (error) {
                            alert("Some thing went wrong!");
                        }
                        return Promise.reject(refreshError)
                    }
                 
                }
                else if(error?.response?.status===401 && prevRequest.sent) {

                    try {
                        const response = await axiosPrivate.post("logout/")
                        if (response.status === 200) {
                            alert("Session expired, please login again.");
                            localStorage.removeItem("user")
                            setUserAuth(null)
                           
                        }
                    }
                    catch (error) {
                        alert("Some thing went wrong!");
                    }
                    
                    return Promise.reject(error);
                   
                }
                return Promise.reject(error);

            }
        )

        return ()=>{
            axiosPrivate.interceptors.request.eject(requestIntercept)
            axiosPrivate.interceptors.response.eject(responseIntercept)
        }
    },[userAuth,refresh])
    

    return axiosPrivate;
}

export default useAxiosPrivate;


import axios from "axios"

const Base_URL = 'http://127.0.0.1:8000/'

export default axios.create({
    baseURL:Base_URL
    })

export const axiosPrivate = axios.create({
    baseURL:Base_URL,
    headers:{
        "Content-Type":"application/json"
    },
    withCredentials:true
})




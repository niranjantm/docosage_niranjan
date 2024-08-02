import { useState } from "react"
import classes from '@/styles/height-Weight-age.module.css'
import { useRouter } from "next/router"
import useAxiosPrivate from "@/hooks/useAxiosPrivate"
import protectedRoutesCustomer from "@/components/protectedRoute"

function Height(){
    const [height,setHeight] = useState(60)
    const [displayHeight,setDisplayHeight] = useState("5'0")
    const router = useRouter()
    const axiosPrivate  = useAxiosPrivate()

   const handleHeightDisplay = (e)=>{
    let feet = Math.floor((e.target.value)/12)
    let inches = e.target.value%12
    setDisplayHeight(`${feet}'${inches}`)
    setHeight(e.target.value)
    
   }

   const handleNext = async()=>{
    try{
        const response = await axiosPrivate.post('updateuserinfo/',{"height":height})
        if(response.status===200){
            router.push('weight')
        }
    }catch(error){
        console.log(error)
    }
   }
return(
    <main className={classes.main}>
        <h1>Tell us your height</h1>
        <p>{"(feet'inch)"}</p>
        <div className={classes.inputContainer}>
            <h3>{displayHeight}</h3>
            <input className={classes.inputSlider} type="range" min={12} onChange={handleHeightDisplay} max={120} step={1} value={height} ></input>
        </div>
        <div className={classes.buttonContainer}>
            <button type='button' className={classes.nextButton} onClick={handleNext}>Next</button>
            <button type='button' className={classes.skipButton}>Skip</button>
        </div>
    </main>
)
}

export default protectedRoutesCustomer(Height);
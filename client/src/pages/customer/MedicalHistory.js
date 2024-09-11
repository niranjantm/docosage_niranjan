
import React,{ useState,useEffect } from 'react'
import Layout from '@/components/Navbar/Layout'
import classes from "@/styles/medicalHistory.module.css"
import useAxiosPrivate from '@/hooks/useAxiosPrivate'


function MedicalHistory() {

    const [formData, setFormData] = useState({ name: "", description: "", dosage: "",frequency:"", start_date: "", end_date: "" })
    const axiosPrivate = useAxiosPrivate()
    const [medicalHistory,setMedicalHistory] = useState([])
    const [editableHistory, setEditableHistory] = useState([]);

    const handleChange = (e) => {
        if (e.target.id == "name" || e.target.id == "description" || e.target.id == "dosage" || e.target.id == "start_date" || e.target.id == "end_date"|| e.target.id == "frequency") {
            setFormData(pre=>{
                return(
                    {...pre,[e.target.id]:e.target.value}
                )
            })
        }
    }

    useEffect(()=>{
        const getMedicalHistory = async()=>{
            try{
                const res = await axiosPrivate.get("usermedication/")
                if(res.status===200){
                    setMedicalHistory(res.data)
                    setEditableHistory(res.data); 
                }
        }catch(error){
            console.log(error)
        }
            
        }
        getMedicalHistory()
    },[])

    const handleDelete = async (id)=>{
        try{
            const res = await axiosPrivate.delete(`usermedication/${id}`)
            if (res.status == 200){
                const newMedicalHistory = medicalHistory.filter((item,index)=>{
                    return item.id != id
                })
                setMedicalHistory(newMedicalHistory)
                setEditableHistory(newMedicalHistory);
            }
        }catch(error){
            console.log(error)
        }
    }
    


    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!formData.name || !formData.description || !formData.dosage || !formData.start_date || !formData.frequency){
            return
        }else{
            try{
                const res = await axiosPrivate.post("usermedication/",formData)
                if(res.status===200){
                    setMedicalHistory(pre=>[...pre,res.data])
                    setEditableHistory(prev => [...prev, res.data])
                    setFormData({name: "", description: "", dosage: "",frequency:"", start_date: "", end_date: ""})
                }
            }catch(error){
                console.log(error)
            }
        }

    }

    const handleUpdate = (e, index) => {
        const { id, value } = e.target;
        const updatedHistory = [...editableHistory]; 
        updatedHistory[index][id] = value; 
        setEditableHistory(updatedHistory); 
    };

    const handleSaveUpdate = async (id, updatedData) => {
        try {
            const res = await axiosPrivate.put(`usermedication/${id}/`, updatedData);
            if (res.status === 200) {
                const updatedHistory = medicalHistory.map((item) =>
                    item.id === id ? res.data : item
                );
                setMedicalHistory(updatedHistory);
                setEditableHistory(updatedHistory); 
            }
        } catch (error) {
            console.error("Error updating medical history:", error);
        }
    };
    return (
        <main className={classes.main}>
            <h2>Add your medication</h2>
            <form onSubmit={handleSubmit} className={classes.form}>
                <div className={classes.formDiv}> 
                    <label htmlFor='name'>Medication name:</label>
                    <input value={formData.name} type='text' id='name' onChange={handleChange}></input>
                </div>

                <div className={classes.formDiv}>
                    <label htmlFor='description'>Medication description:</label>
                    <textarea value={formData.description} type='text' id='description' onChange={handleChange}></textarea>
                </div>

                <div className={classes.formDiv}>
                    <label htmlFor='dosage'>Medication dosage:</label>
                    <input value={formData.dosage} type='text' id='dosage' onChange={handleChange}></input>
                </div>
                <div className={classes.formDiv}>
                    <label htmlFor='frequency'>Medication frequency:</label>
                    <input value={formData.frequency}  type='text' id='frequency' onChange={handleChange}></input>
                </div>

                <div className={classes.formStartDateDiv}>
                    <label htmlFor='start_date'>Start Date:</label>
                    <input value={formData.start_date} type='date' id='start_date' onChange={handleChange}></input>
                </div>
                <div className={classes.formEndDateDiv}>
                    <label htmlFor='end_date'>End Date:</label>
                    <input value={formData.end_date} type='date' id='end_date' onChange={handleChange}></input>
                </div>

                <div className={classes.submitBtnDiv}>
                <button className={classes.submitBtn} >Submit</button>
                </div>
               
            </form>
            <h3>Medical History </h3>
            

            { medicalHistory.length>0?medicalHistory.map((item,index)=>{
                return(
                    <section key={item.id} className={classes.oldMedicalHistoryContainer}>


                    <div className={classes.historyDiv}> 
                        <label htmlFor='name'>Medication name:</label>
                        <input value={item.name}  type='text' id='name' onChange={(e) => handleUpdate(e, index)}></input>
                    </div>
    
                    <div className={classes.historyDiv}>
                        <label htmlFor='description'>Medication description:</label>
                        <textarea value={item.description}  type='text' id='description' onChange={(e) => handleUpdate(e, index)}></textarea>
                    </div>
    
                    <div className={classes.historyDiv}>
                        <label htmlFor='dosage'>Medication dosage:</label>
                        <input value={item.dosage}  type='text' id='dosage' onChange={(e) => handleUpdate(e, index)}></input>
                    </div>
                    <div className={classes.historyDiv}>
                        <label htmlFor='frequency'>Medication frequency:</label>
                        <input value={item.frequency} type='text' id='frequency' onChange={(e) => handleUpdate(e, index)}></input>
                    </div>
    
                    <div className={classes.historyDiv}>
                        <label htmlFor='start_date'>Start Date:</label>
                        <input value={item.start_date}  type='date' id='start_date' onChange={(e) => handleUpdate(e, index)}></input>
                    </div>
                    <div className={classes.historyDiv}>
                        <label htmlFor='end_date'>End Date:</label>
                        <input value={item.end_date} type='date' id='end_date' onChange={(e) => handleUpdate(e, index)}></input>
                    </div>
    
                    <div className={classes.updateAndDeleteBtn}>
                    <button className={classes.updateBtn} onClick={() => handleSaveUpdate(item.id, editableHistory[index])}>Update</button>
                    <button className={classes.deleteBtn} onClick = {()=>handleDelete(item.id)} >Delete</button>
                    </div>
                    
    
                </section>
                )
            }):<p>No Records found</p>
           }
        </main>
    )
}

MedicalHistory.NavLayout = Layout
export default MedicalHistory
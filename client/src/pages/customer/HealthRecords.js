import React, { useEffect, useRef, useState } from 'react'
import protectedRoutesCustomer from '@/components/protectedRoute'
import Layout from '@/components/Navbar/Layout'
import classes from "@/styles/customerHealthRecords.module.css"
import Image from 'next/image'
import { IoMdCloseCircle } from "react-icons/io";
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import reports from '@/data/patientReportOptions'

function HealthRecords() {

    const baseUrl = "http://localhost:8000"



    const [files, setFiles] = useState([])
    const fileRef = useRef()
    const [error, setError] = useState("")
    const axiosPrivate = useAxiosPrivate()
    const [formData,setFormData] = useState({title:"",description:""})

    const [savedFiles, setSavedFiles] = useState([])

    const handleUploadFile = (e) => {
        e.preventDefault()
        fileRef.current.click()

    }

    const handleInputChange=(e)=>{
        if(e.target.id==="title" || e.target.id==="description"){
            setFormData((pre)=>{
                return(
                    {...pre,[e.target.id]:e.target.value}
                )
            })
        }
        
    }

    const handleFileChange = (e) => {


        const selectedFiles = e.target.files;
        setFiles([...files, ...selectedFiles]);

    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", e.target.title.value)
        if (formData.get("title") == "") {
            setError("Title is necessary!")
        }

        formData.append("description", e.target.description.value)
        formData.append("report_type",e.target.report_type.value)


        files.forEach((file, index) => {
            formData.append(`files`, file)
        })

        try {
            const response = await axiosPrivate.post('healthrecord/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 201) {
                setSavedFiles(pre => [response.data,...pre])
                setFiles([])
                setFormData({title:"",description:""})
            }
        } catch (error) {
            console.error('Error uploading file:', error);

        }

    }

    const handleRemoveFile = (index) => {
        const newFiles = files.filter((item, i) => {
            return i != index
        })
        setFiles(newFiles)
    }

    const handleDeleteRecord= async (id)=>{
        try{
            const res = await axiosPrivate.delete(`healthrecord/${id}`)
            if(res.status===200){
                const updatedOldRecords = savedFiles.filter((item)=>{
                    return item?.record_id != id
                })
                setSavedFiles(updatedOldRecords)
            }
        }catch(error){
            console.log(error)
        }
    }

    useEffect(()=>{
       const fetchOldRecords = async()=>{
       try{
        const res = await axiosPrivate.get("healthrecord/")
        if(res.status==200){
            console.log(res.data)
            setSavedFiles(res.data)
        }
       }catch(error){
        console.log(error)
       }
       }
       fetchOldRecords()
    },[])



    return (
        <main className={classes.main}>
            <section className={classes.formContainer}>
                <form className={classes.form} onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor='title'>Title</label>
                        <input value={formData.title}  className={classes.input} onChange={handleInputChange} name='title' id='title' type='text'></input>
                    </div>
                    <div>
                        <label htmlFor='report'>Select report type</label>
                        <select className={classes.select} onChange={(e)=>console.log(e.target.value)}  name='report_type' id='report' type='text'>
                            {reports.map((item,index)=>{
                                return(
                                    <option key={item}>{item}</option>
                                )
                                
                            })}
                        </select>
                    </div>

                    <div>
                        <label htmlFor='description'>Description</label>
                        <textarea value={formData.description} className={classes.textArea} onChange={handleInputChange} id='description' name='description' type='text'></textarea>
                    </div>

                    <div>
                        <input name='files' type='file' accept='pdf,image/*' onChange={handleFileChange} ref={fileRef} multiple hidden></input>
                        <button type='button' onClick={handleUploadFile}>Upload image</button>
                    </div>

                    <button>Submit</button>
                    {error && <p className={classes.error}>{error}</p>}
                </form>
                <section className={classes.selectedFilesContainer}>
                   
                    {files.map((file, index) => {
                        return (
                            <div key={index} className={classes.selectedFileDiv}>
                                <button className={classes.removeImageButton} type='button' onClick={() => handleRemoveFile(index)}><IoMdCloseCircle size={25} color='red'></IoMdCloseCircle></button>
                                <Image className={classes.selectedImage} src={URL.createObjectURL(file)} width={200} height={200} alt={`document-${index}`} ></Image>
                            </div>

                        )
                    })}
                </section>
            </section>
            
            <section className={classes.oldRecordsContainer}>
            {savedFiles.length===0?<h2>No health records available </h2>:<h2>Your old health records </h2>}
            {savedFiles.map((item, index) => {
                return (
                    <div className={classes.savedRecordDiv} key={index}>
                        <div className={classes.titleAndDescriptionDiv}>
                            <h3>{`Title: ${item?.title}`}</h3>
                            <p>{`Report Type: ${item?.report_type}`}</p>
                            <p>{`Description: ${item?.description}`}</p>
                            {/* <p>{dayjs(item?.uploaded_at).format("DD-MM-YY HH:MM:A")}</p> */}
                            <button type='button' onClick={()=>handleDeleteRecord(item?.record_id)}>Delete record</button>
                        </div>
                        <div className={classes.savedImagesDiv}>
                            {item?.file_urls?.map((url, i) => {
                                return (
                                <div key={i}>
                                    <a href={baseUrl+url} download={true} target='_blank'>
                                    <Image key={i} alt={`${item.title} file`} src={`http://localhost:8000${url}`} width={100} height={100}></Image>
                                    </a>
                                    
                                </div>
                                   


                                )

                            })}

                        </div>
                        
                    </div>
                )
            })}
            
            </section>


        </main>
    )
}

HealthRecords.NavLayout = Layout;
export default protectedRoutesCustomer(HealthRecords);
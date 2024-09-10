import React, { useEffect, useRef } from 'react'
import classes from "@/styles/menu-options.module.css"
import { FaAngleRight } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import { axiosPrivate } from '@/pages/api/axios';
import Link from 'next/link';
import items from "@/data/sidebarData.json"
import SidebarItem from './SidebarItem';


function MenuOptions({ showOptions, setShowOptions }) {

    const options = ["My Profile", "Task", "Habits", "Add Members", "Find Doctor", "Find Diagnosis", "Order Medication", "Notification Settings", "Help", "Contact Us"]
    const menuRef = useRef()
    const { userAuth, setUserAuth } = useAuth()
    const [openSubmenus, setOpenSubmenus] = useState({});
    const router = useRouter()

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        if (showOptions) {
            menuRef.current.classList.add(classes.show)
            menuRef.current.classList.remove(classes.hide)
            document.body.style.overflow = 'hidden';
        }
        else {
            menuRef.current.classList.add(classes.hide)
            menuRef.current.classList.remove(classes.show)
            document.body.style.overflow = originalOverflow;
        }

        return () => {

            document.body.style.overflow = originalOverflow;
        };
    }, [showOptions])

    const handleOptionClick = async (e) => {
        e.preventDefault()

        console.log(e.target.id)

        if (e.target.name === "Logout") {

            try {
                const response = await axiosPrivate.post("logout/")
                if (response.status === 200) {
                    localStorage.removeItem("user")
                    setUserAuth(null)
                }
            }
            catch (error) {
                console.error(error)
            }

        }
    }

    return (
        <main className={classes.main} onClick={(e) => setShowOptions(false)}>
            <div className={classes.mainDiv} ref={menuRef} onClick={(e) => { e.stopPropagation() }}>
                <div className={classes.closeButtonDiv}>
                    <button type='button' className={classes.closeButton} onClick={() => setShowOptions(false)}><IoMdClose size={30}></IoMdClose></button>
                </div>
                <div className={classes.infoDiv}>
                    <div className={classes.imageAndPointsDiv}>

                    </div>
                    <div className={classes.nameAndEmailDiv}>
                        <h2>{userAuth?.name ? userAuth.name : "Guest Account"}</h2>
                        <p>{userAuth?.email ? userAuth.email : ''}</p>
                    </div>
                </div>
                <div className={classes.options}>
                    {/* {data?.map((item,index)=>{
                        return( */}

                    {/* {item.children? <div className={classes.optionWithBorder}>{item?.title}</div>: <Link href={item?.path} key={index} className={classes.optionWithBorder}  >
                        <p className={classes.optionText}>{item?.title}</p>
                        <FaAngleRight></FaAngleRight>
                            </Link>} */}


                    {items.map((item, index) => (
                        <div key={index}>
                            <div
                                className={classes.optionWithBorder}
                                onClick={() => item.children ? toggleSubmenu(index) : null}
                            >
                                <p className={classes.optionText}>{item.title}</p>
                                {item.children ?
                                    <FaAngleRight className={`${classes.menuArrow} ${openSubmenus[index] ? classes.rotate : ''}`} />
                                    : null
                                }
                            </div>
                            {item.children && openSubmenus[index] && (
                                <div className={classes.subMenu}>
                                    {item.children.map((child, childIndex) => (
                                        <div key={childIndex} className={classes.optionWithoutBorder}>
                                            <a href={child.path}>{child.title}</a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}



                    {/* )
                    })} */}

                    {/* <Link href={"/"} className={classes.optionWithBorder}  >
                        <p className={classes.optionText}>My Profile</p>
                        <FaAngleRight></FaAngleRight>
                    </Link>
                    {
                        userAuth?.account_type === "customer" && <div  className={classes.optionWithBorder}><p className={classes.optionText}>Health Records</p>
                            <FaAngleRight className={classes.menuArrow}></FaAngleRight> </div>
                    }
                    <Link href={"/"} className={classes.optionWithBorder}  >
                        <p className={classes.optionText}>Task</p>
                        <FaAngleRight></FaAngleRight>
                    </Link>
                    <Link href={"/"} className={classes.optionWithBorder}  >
                        <p className={classes.optionText}>Habits</p>
                        <FaAngleRight></FaAngleRight>
                    </Link>
                    <Link href={"/"} className={classes.optionWithBorder}  >
                        <p className={classes.optionText}>Add Members</p>
                        <FaAngleRight></FaAngleRight>
                    </Link>
                    <Link href={"/dashboard/FindDoctorMenu"} className={classes.optionWithBorder} onClick={() => setShowOptions(false)} >
                        <p className={classes.optionText}> Find Doctor</p>
                        <FaAngleRight></FaAngleRight>
                    </Link>
                    <Link href={"/"} className={classes.optionWithBorder}  >
                        <p className={classes.optionText}>Find Diagnosis</p>
                        <FaAngleRight></FaAngleRight>
                    </Link>
                    <Link href={"/"} className={classes.optionWithBorder} >
                        <p className={classes.optionText}>Order Medication</p>
                        <FaAngleRight></FaAngleRight>
                    </Link>
                    <Link href={"/"} className={classes.optionWithBorder}  >
                        <p className={classes.optionText}>Notification Settings</p>
                        <FaAngleRight></FaAngleRight>
                    </Link>
                    <Link href={"/"} className={classes.optionWithBorder}  >
                        <p className={classes.optionText}>Help</p>
                        <FaAngleRight></FaAngleRight>
                    </Link>
                    <Link href={"/"} className={classes.optionWithBorder}  >
                        <p className={classes.optionText}>Contact Us</p>
                        <FaAngleRight></FaAngleRight>
                    </Link> */}

                    <button className={classes.optionWithoutBorder} type='button' name={userAuth?.name ? "Logout" : "Login"} onClick={handleOptionClick}>{userAuth?.name ? "Logout" : "Login"} <FaAngleRight></FaAngleRight></button>
                </div>
            </div>

        </main>
    )
}

export default MenuOptions
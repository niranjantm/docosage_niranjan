import React, { useState } from 'react'
import classes from "@/styles/navbar.module.css"
import { IoMenu } from "react-icons/io5";
import MenuOptions from '../MenuOptions';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';

export default function Navbar() {
  const [showOptions,setShowOptions] = useState(false)
  const {userAuth,setUserAuth} = useAuth()

  const handleOptions=(e)=>{
    e.preventDefault()
    setShowOptions(pre=>!pre)
  }
  return (
  <nav className={classes.nav}>
<ul className={classes.ul}>
  <li><button className={classes.sandwitch} type='button' onClick={handleOptions}><IoMenu size={40}></IoMenu></button></li>
  <li>Docosage</li>
  <li>
  <Link href={!userAuth?"/dashboard/login":"#"} className={classes.login}>{userAuth?.name?"Account":"Login"}</Link>
    </li>
</ul>

{showOptions && <MenuOptions showOptions={showOptions} setShowOptions={setShowOptions}></MenuOptions>}

    </nav>
  )
}

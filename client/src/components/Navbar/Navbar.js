import React, { useState } from 'react'
import classes from "@/styles/navbar.module.css"
import { IoMenu } from "react-icons/io5";
import MenuOptions from '../MenuOptions';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';

export default function Navbar() {
  const [showOptions, setShowOptions] = useState(false)
  const { userAuth, setUserAuth } = useAuth()

  const handleOptions = (e) => {
    e.preventDefault()
    setShowOptions(pre => !pre)


   

    
  }
  return (
    <nav className={classes.nav}>
      <ul className={classes.ul}>
        <li><button className={classes.sandwitch} type='button' onClick={handleOptions}><IoMenu size={40}></IoMenu></button></li>
        <li>Docosage</li>
        {!userAuth && <li>
          <Link href={"/dashboard/login"} className={classes.login}>Login</Link>
        </li>}
        {userAuth?.account_type && <li>
          {<Link href={!userAuth?.account_type==='customer'?"/information/gender": "/doctorInformation"} className={classes.login}>{userAuth?.name ? "Account" : "Login"}</Link>}
        </li>}
      </ul>

      {showOptions && <MenuOptions showOptions={showOptions} setShowOptions={setShowOptions}></MenuOptions>}

    </nav>
  )
}

import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Link from "next/link";
import Layout from "@/components/Navbar/Layout";
import { useEffect } from "react";
import useAuth from "@/hooks/useAuth";



const inter = Inter({ subsets: ["latin"] });

export default function Home() {

  const {userAuth} = useAuth()


console.log(userAuth)
  
  return (
   <div>
    {userAuth?.account_type==="doctor" && <Link href={"doctor/manageAvailability"}>manage availability</Link>}

   </div>
  )


}
Home.NavLayout = Layout

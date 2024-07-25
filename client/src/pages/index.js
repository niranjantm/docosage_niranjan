import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Link from "next/link";
import Layout from "@/components/Navbar/layout";


const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  
  return (
   <div>
    <Link href={"/information/gender"}>update Info</Link>
   </div>
  )


}
Home.NavLayout = Layout

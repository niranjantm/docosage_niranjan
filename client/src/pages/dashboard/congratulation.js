import React from 'react'
import classes from "@/styles/congratulations.module.css"

function congratulation() {
  return (
   <main className={classes.main}>
    <div>
        image
    </div>
    <div className={classes.introContainer}>
        <h1>
            Congratulation!
        </h1>
        <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
    </div>
    <div className={classes.buttonContainer}>
        <button>Setup Goal and other information</button>  
        <button>Go to home</button>  
    </div>
   </main>
  )
}

export default congratulation
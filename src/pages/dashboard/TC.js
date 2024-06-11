import React, { useState } from 'react'
import classes from "@/styles/TC.module.css"

function TC() {

    const [disable,setDisable] = useState(false)

    const agreeHandler =(e)=>{
       setDisable(e.target.checked);
    }


    return (
        <main className={classes.main}>
            <h1>Terms and Conditions</h1>

           
           <div className={classes.tc_container}>
           <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

                Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam consequat. Curabitur augue lorem, dapibus quis, laoreet et, pretium ac, nisi. Aenean magna nisl, mollis quis, molestie eu, feugiat in, orci. In hac habitasse platea dictumst.
            </p>
            </div>
            <div className={classes.checkBox_container}>
                <input type='checkbox' onChange={agreeHandler}></input>
                <p>I have read and agree to these Terms and Conditions</p>
            </div>
            <div className={classes.button_container}>
                <button>Cancel</button>
                <button className={classes.agree_button} disabled = {!disable} >Agree</button>
            </div>

        </main>
    )
}

export default TC
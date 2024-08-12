import React from 'react'
import classes from "@/styles/appointmentCard.module.css"

function AppointmentCard({children}) {
  return (
    <section className={classes.mainSection}>
        {children}
    </section>
  )
}

export default AppointmentCard
import express from "express"
import cors from "cors"

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


import alertsRouter from "./routes/alerts.js"

app.use("/alerts", alertsRouter)

export default app

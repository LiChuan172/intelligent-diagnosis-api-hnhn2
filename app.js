import express from "express"
import cors from "cors"

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


import alertsRouter from "./routes/alerts.js"
import sampleFilesRouter from "./routes/sampleFiles.js"

app.use("/alerts", alertsRouter)
app.use("/sampleFiles", sampleFilesRouter)

export default app

import express from "express"
const router = express.Router()

import { alert_latest, alert_alerts } from "../hnhn/alerts.js"

router.get("/", async function (req, res, next) {
  const { alerts, totalPage } = await alert_alerts(req.query)
  if (alerts && totalPage != null) {
    res.send({
      success: true,
      content: {
        alerts,
        totalPage,
      },
    })
  } else {
    next()
  }
})

router.get("/latest", async function (req, res, next) {
  const { wtId, ipNum } = req.query
  const alert = await alert_latest({ wtId, ipNum })
  if (alert) {
    res.send({
      success: true,
      content: {
        alert,
      },
    })
  } else {
    next()
  }
})

// Alerts default
router.use(function (
  { method, protocol, hostname, originalUrl },
  res
) {
  res.send({
    success: false,
    message: `${method} ${protocol}://${hostname}${originalUrl} 参数或路径不正确`,
  })
})

export default router

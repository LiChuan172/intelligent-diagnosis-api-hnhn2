import express from "express"
const router = express.Router()

import {sampleFile_charts} from "../hnhn/sampleFiles.js"

router.get("/charts", async function (req, res, next) {
  const { sfName } = req.query
  if (sfName) {
    const charts = await sampleFile_charts(sfName)
    res.send({
      success: true,
      content: {
        charts,
      },
    })
  } else {
    next()
  }
})

// default router
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

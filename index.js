import app from "./app.js"

const PORT = 6789

app.listen(PORT, () => {
  console.log(`Express server started on port ${PORT}.`)
})

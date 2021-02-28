import mysql from "mysql2"

export async function queryMysql(database, sql) {
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database,
  })

  return await new Promise((res, rej) => {
    connection.query(
      sql,
      async function (err, results, fields) {
        if (err) {
          rej(err)
        } else {
          res(results)
        }
        connection.destroy()
      }
    )
  })
}
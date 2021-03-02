import mysql from "mysql2"

export async function queryMysql(host, database, sql) {
  const connection = mysql.createConnection({
    host,
    user: "root",
    password: "password",
    // password: "test",
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
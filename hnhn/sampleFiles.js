import {
  toMysqlDT,
  getDatabaseByIpNum,
  getTable,
  getHostByIpNum,
} from "./utilities.js"

import zlib from "zlib"

import { queryMysql } from "../mysql/index.js"

export async function sampleFile_charts(sfName) {
  const [wtId, ipNum, type, id, sfDatetime] = sfName.split(
    "_"
  )
  const saveTime = toMysqlDT(sfDatetime)
  const database = getDatabaseByIpNum(ipNum)
  const host = getHostByIpNum(ipNum)
  const table = getTable(wtId, ipNum)
  if (type == "inclin") {
    return await inclin_charts({host, id, database, table })
  } else {
    return await vib_charts({
      host,
      id,
      database,
      table,
      saveTime,
    })
  }
}

async function inclin_charts({host, id, database, table }) {
  const pairs = await getPairs({host, id, database, table })
  return [pairs]
}

async function vib_charts({
  host,
  id,
  database,
  table,
  saveTime,
}) {
  return [
    ...(await timeAndFrequencyOrderDomainCharts({
      host,
      id,
      database,
      table,
      saveTime,
    })),
    ...(await rmsCharts({host, id, database, table })),
  ]
}

async function timeAndFrequencyOrderDomainCharts({
  host,
  id,
  database,
  table,
  saveTime,
}) {
  const blob = await getBlob({
    host,
    id,
    database,
    table,
    saveTime,
  })
  const { arrFloat, speed, fs } = await parseVib(blob)
  return [
    {
      id: 1,
      func: "timeDomain",
      input: {
        fs: 100,
        sample: arrFloat,
        fb: 60,
        bandpass: {
          f1: 0,
          f2: 100,
        },
      },
    },
    {
      id: 2,
      func: "frequencyDomain",
      input: {
        fs: 100,
        sample: arrFloat,
        fb: 60,
        bandpass: {
          f1: 0,
          f2: 100,
        },
      },
    },
  ]
}

async function rmsCharts({host, id, database, table }) {
  const pairs = await getPairs({host, id, database, table })
  const input = {
    pairs,
    unit: "m/s²",
    titleText: `>>0-100加速度有效值`,
    mark: {
      yAxisNormalLevel: {
        value: "0",
        color: "#04B404",
      },
      yAxisWarnLevel: {
        value: 100,
        color: "#FCFF00",
      },
      yAxisDangerLevel: {
        value: 200,
        color: "#DC143C",
      },
      yAxisMax: {
        value: 200 * 1.5,
      },
      opacity: 0.3,
    },
  }
  return [
    {
      id: 3,
      func: "pointTimeValuePairs",
      expanded: true,
      input,
    },
  ]
}

async function getPairs({ host, id, database, table }) {
  const dtTo = new Date()
  const dtFrom = new Date(
    dtTo - 1 * 30 * 24 * 60 * 60 * 1000
  )
  const mysqlDtTo = toMysqlDT(dtTo)
  const mysqlDtFrom = toMysqlDT(dtFrom)
  if (table.includes("vib")) {
    const sql = `
      select saveTime, vib_rms
      from ${table}
      where id = ${id}
      and saveTime >= '${mysqlDtFrom}'
      and saveTime <= '${mysqlDtTo}'
      order by saveTime
    `

    const sqlResults = await queryMysql(host, database, sql)
    return sqlResults.map(({ saveTime, vib_rms }) => [
      saveTime.getTime(),
      vib_rms,
    ])
  }

  if (table.includes("inclin")) {
    const sql = `
      select avangle, avdirection
      from ${table}
      where id = ${id}
      and saveTime >= '${mysqlDtFrom}'
      and saveTime <= '${mysqlDtTo}'
      limit 6000
    `
    const sqlResults = await queryMysql(host, database, sql)
    return sqlResults.map(({ avangle, avdirection }) => [
      avangle,
      avdirection,
    ])
  }
  return []
}

async function getBlob({host, id, database, table, saveTime }) {
  const sql = `
    select vib_wave
    from ${table}
    where id = ${id}
    and saveTime = '${saveTime}';
  `

  const sqlResult = await queryMysql(host,database, sql)
  return sqlResult[0].vib_wave
}

async function parseVib(blob) {
  const arrFloat = await new Promise((res, rej) => {
    zlib.unzip(blob.slice(51), (err, buffer) => {
      if (err) {
        rej(err)
      } else {
        const arr = []
        for (
          let index = 0;
          index < buffer.length / 4;
          index++
        ) {
          arr.push(buffer.readFloatLE(index * 4))
        }
        res(arr)
      }
    })
  })

  const speed = blob.readFloatLE(11)
  const fs = blob.readFloatLE(15)

  return { arrFloat, speed, fs }
}

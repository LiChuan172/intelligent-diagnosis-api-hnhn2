import { queryMysql } from "../mysql/index.js"
import { toMysqlDT } from "./utilities.js"

export async function alert_alerts(query) {
  const total = await totalAlertsPage(query)
  const results = await alerts(query)

  if (total == null) {
    return {
      alerts: [],
      totalPage: null
    }
  }
  return {
    alerts: results,
    totalPage: total[0]["count(*)"] / 5,
  }
}

async function totalAlertsPage({
  wtId,
  ipNum,
  altType,
  altState,
  dtFrom,
  dtTo,
}) {
  if (altType != "正常" && altType != "全部") {
    return null
  }
  if (altState != "已处理" && altState != "全部") {
    return null
  }
  wtId = wtId == null ? 6 : wtId
  ipNum =
    ipNum == null || ipNum == "全部"
      ? "MPV-WC00-RD1"
      : ipNum

  return await alertsCountQuery({
    wtId,
    ipNum,
    dtFrom,
    dtTo,
  })
}

async function alerts({
  wtId,
  ipNum,
  altType,
  altState,
  dtFrom,
  dtTo,
  page,
}) {
  if (altType != "正常" && altType != "全部") {
    return []
  }
  if (altState != "已处理" && altState != "全部") {
    return []
  }
  wtId = wtId == null ? 6 : wtId
  ipNum =
    ipNum == null || ipNum == "全部"
      ? "MPV-WC00-RD1"
      : ipNum
  page = page < 1 ? 1 : page
  const sqlResults = await alertsQuery({
    wtId,
    ipNum,
    dtFrom,
    dtTo,
    page,
  })

  return sqlResults.map((sqlResult) => {
    const type = getTypeByIpNum(ipNum)
    const valValue =
      type == "vib" ? sqlResult.vib_rms : sqlResult.avangle
    const valId = `${wtId}_${ipNum}_${type}_${sqlResult.id}_${sqlResult.saveTime}`
    const valName =
      type == "vib" ? "加速度有效值" : "倾斜角"
    const valTypeZh = valName
    const bpLow = 10
    const bpHigh = 1000
    const thhValue1 = 100
    const thhValue2 = 200
    const mlfJdgName = null
    const mlfName = null
    const mlfDescription = null
    const mlfAdvice = null
    const altType = "正常"
    const altState = "已处理"
    const sfDatetime = sqlResult.saveTime
    const wtNum = `WT${wtId}`
    const ipName = getIpNameByIpNum(ipNum)
    const frmName = "连坪风电场"
    const sfName = valId

    return {
      valId,
      valValue,
      valName,
      valTypeZh,
      bpLow,
      bpHigh,
      thhValue1,
      thhValue2,
      mlfJdgName,
      mlfName,
      mlfDescription,
      mlfAdvice,
      altType,
      altState,
      sfDatetime,
      wtId,
      wtNum,
      ipName,
      ipNum,
      frmName,
      sfName,
    }
  })
}

export async function alert_latest({ wtId, ipNum }) {
  wtId = wtId == null ? 6 : wtId
  ipNum = ipNum == null ? "MPV-WC00-RD1" : ipNum
  const sqlResult = (
    await alertLastestQuery({ wtId, ipNum })
  )[0]
  const type = getTypeByIpNum(ipNum)
  const valValue =
    type == "vib" ? sqlResult.vib_rms : sqlResult.avangle
  const valId = `${wtId}_${ipNum}_${type}_${sqlResult.id}_${sqlResult.saveTime}`
  const valName = type == "vib" ? "加速度有效值" : "倾斜角"
  const valTypeZh = valName
  const bpLow = 10
  const bpHigh = 1000
  const thhValue1 = 100
  const thhValue2 = 200
  const mlfJdgName = null
  const mlfName = null
  const mlfDescription = null
  const mlfAdvice = null
  const altType = "正常"
  const altState = "已处理"
  const sfDatetime = sqlResult.saveTime
  const wtNum = `WT${wtId}`
  const ipName = getIpNameByIpNum(ipNum)
  const frmName = "连坪风电场"
  const sfName = valId

  return {
    valId,
    valValue,
    valName,
    valTypeZh,
    bpLow,
    bpHigh,
    thhValue1,
    thhValue2,
    mlfJdgName,
    mlfName,
    mlfDescription,
    mlfAdvice,
    altType,
    altState,
    sfDatetime,
    wtId,
    wtNum,
    ipName,
    ipNum,
    frmName,
    sfName,
  }
}

function alertLastestQuery({ wtId, ipNum }) {
  const table = getTable(wtId, ipNum)
  const id = getIdByIpNum(ipNum)
  const type = getTypeByIpNum(ipNum)
  const database = getDatabaseByIpNum(ipNum)
  const waveFeatureName =
    type == "inclin" ? "inc_wave_byte" : "vib_wave"

  const sql = `
    select *
    from ${table}
    where id = ${id}
    and ${waveFeatureName} is not null
    order by saveTime desc
    limit 1;
  `
  return queryMysql(database, sql)
}

function alertsQuery({ wtId, ipNum, dtFrom, dtTo, page }) {
  const table = getTable(wtId, ipNum)
  const id = getIdByIpNum(ipNum)
  const type = getTypeByIpNum(ipNum)
  const database = getDatabaseByIpNum(ipNum)
  const waveFeatureName =
    type == "inclin" ? "inc_wave_byte" : "vib_wave"

  let sql = `
    select *
    from ${table}
    where id = ${id}
    and ${waveFeatureName} is not null`

  if (dtFrom != "") {
    sql = `${sql}
      and saveTime >= '${toMysqlDT(dtFrom)}'`
  }

  if (dtTo != "") {
    sql = `${sql}
      and saveTime <= '${toMysqlDT(dtTo)}'`
  }

  sql = `${sql}
    order by saveTime desc`

  sql = `${sql}
    limit 5 offset ${(page - 1) * 5}`
  return queryMysql(database, sql)
}

function alertsCountQuery({ wtId, ipNum, dtFrom, dtTo }) {
  const table = getTable(wtId, ipNum)
  const id = getIdByIpNum(ipNum)
  const type = getTypeByIpNum(ipNum)
  const database = getDatabaseByIpNum(ipNum)
  const waveFeatureName =
    type == "inclin" ? "inc_wave_byte" : "vib_wave"

  let sql = `
    select count(*)
    from ${table}
    where id = ${id}
    and ${waveFeatureName} is not null`

  if (dtFrom != "") {
    sql = `${sql}
      and saveTime >= '${toMysqlDT(dtFrom)}'`
  }

  if (dtTo != "") {
    sql = `${sql}
      and saveTime <= '${toMysqlDT(dtTo)}'`
  }
  return queryMysql(database, sql)
}

function getMachineIdByWtId(wtId) {
  const machine_ids = {
    [6]: "20033012333750951",
    [20]: "20033111035375456",
  }
  return machine_ids[wtId]
}

function getTypeByIpNum(ipNum) {
  switch (ipNum) {
    case "MPA-TB00-000":
    case "MPA-TT00-000":
      return "inclin"
    case "MPV-WC00-RD1":
    case "MPV-WC00-AD1":
      return "vib"
  }
}

function getDatabaseByIpNum(ipNum) {
  switch (ipNum) {
    case "MPA-TB00-000":
    case "MPA-TT00-000":
    case "MPV-WC00-RD1":
    case "MPV-WC00-AD1":
      return "jk_tt_dau6000_1_2014"
  }
}

function getIdByIpNum(ipNum) {
  switch (ipNum) {
    case "MPA-TB00-000":
      return 1
    case "MPA-TT00-000":
      return 2
    case "MPV-WC00-RD1":
      return 0
    case "MPV-WC00-AD1":
      return 1
  }
}

function getTable(wtId, ipNum) {
  const machine_id = getMachineIdByWtId(wtId)
  const type = getTypeByIpNum(ipNum)
  return `d_${machine_id}_${type}`
}

function getIpNameByIpNum(ipNum) {
  switch (ipNum) {
    case "MPA-TB00-000":
      return "塔筒塔底倾角测点"
    case "MPA-TT00-000":
      return "塔筒塔顶倾角测点"
    case "MPV-WC00-RD1":
      return "机舱径向水平测点"
    case "MPV-WC00-AD1":
      return "机舱轴向水平测点"
  }
}

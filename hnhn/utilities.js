export function getIpNumsByType(type) {
  switch (type) {
    case "inclin":
      return ["MPA-TB00-000", "MPA-TT00-000"]
    case "vib":
      return [
        "MPV-WC00-RD1",
        "MPV-WC00-AD1",
        "MPV-MB01-RD1",
        "MPV-WB01-BR0",
        "MPV-WB02-BR0",
        "MPV-WB03-BR0",
        "MPV-PB01-RD0",
        "MPV-PB02-RD0",
        "MPV-PB03-RD0",
        "MPV-YB00-RD1",
      ]
  }
}

export function toMysqlDT(strDT) {
  const date = new Date(strDT)
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  const hs = date.getHours()
  const ms = date.getMinutes()
  const ss = date.getSeconds()
  return `${y}-${td(m)}-${td(d)} ${td(hs)}:${td(ms)}:${td(
    ss
  )}`
}

function td(num) {
  return `0${num}`.slice(-2)
}

export function getDatabaseByIpNum(ipNum) {
  switch (ipNum) {
    case "MPA-TB00-000":
    case "MPA-TT00-000":
    case "MPV-WC00-RD1":
    case "MPV-WC00-AD1":
      return "jk_tt_dau6000_1_2014"
    case "MPV-MB01-RD1":
    case "MPV-WB01-BR0":
    case "MPV-WB02-BR0":
    case "MPV-WB03-BR0":
    case "MPV-PB01-RD0":
    case "MPV-PB02-RD0":
    case "MPV-PB03-RD0":
    case "MPV-YB00-RD1":
      return "jk_yp_dau6000_1_2014"
  }
  return "jk_tt_dau6000_1_2014"
}

function getMachineIdByWtId(wtId, ipNum) {
  const ttIpNums = [
    "MPA-TB00-000",
    "MPA-TT00-000",
    "MPV-WC00-RD1",
    "MPV-WC00-AD1",
  ]

  const ypIpNums = [
    "MPV-MB01-RD1",
    "MPV-WB01-BR0",
    "MPV-WB02-BR0",
    "MPV-WB03-BR0",
    "MPV-PB01-RD0",
    "MPV-PB02-RD0",
    "MPV-PB03-RD0",
    "MPV-YB00-RD1",
  ]

  let machine_ids = {
    [6]: "20033012333750951",
    [20]: "20033111035375456",
  }
  if (ypIpNums.includes(ipNum)) {
    machine_ids = {
      [6]: "21020308481175365",
      [20]: "21020308484006212",
    }
  }
  return machine_ids[wtId]
}

export function getTable(wtId, ipNum) {
  const machine_id = getMachineIdByWtId(wtId, ipNum)
  const type = getTypeByIpNum(ipNum)
  return `d_${machine_id}_${type}`
}

export function getHostByIpNum(ipNum) {
  switch (ipNum) {
    case "MPA-TB00-000":
    case "MPA-TT00-000":
    case "MPV-WC00-RD1":
    case "MPV-WC00-AD1":
      return "localhost"
    case "MPV-MB01-RD1":
    case "MPV-WB01-BR0":
    case "MPV-WB02-BR0":
    case "MPV-WB03-BR0":
    case "MPV-PB01-RD0":
    case "MPV-PB02-RD0":
    case "MPV-PB03-RD0":
    case "MPV-YB00-RD1":
      return "localhost"
  }
  return "localhost"
}

function getTypeByIpNum(ipNum) {
  switch (ipNum) {
    case "MPA-TB00-000":
    case "MPA-TT00-000":
      return "inclin"
    case "MPV-MB01-RD1":
    case "MPV-WB01-BR0":
    case "MPV-WB02-BR0":
    case "MPV-WB03-BR0":
    case "MPV-PB01-RD0":
    case "MPV-PB02-RD0":
    case "MPV-PB03-RD0":
    case "MPV-YB00-RD1":
    case "MPV-WC00-RD1":
    case "MPV-WC00-AD1":
      return "vib"
  }
  return "inclin"
}

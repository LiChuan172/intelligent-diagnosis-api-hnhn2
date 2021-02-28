export function getIpNumsByType(type) {
  switch (type) {
    case "inclin":
      return ["MPA-TB00-000", "MPA-TT00-000"]
    case "vib":
      return ["MPV-WC00-RD1", "MPV-WC00-AD1"]
  }
}

export function toMysqlDT(strDT) {
  const date = new Date(strDT)
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth() + 1
  const d = date.getUTCDate()
  const hs = date.getUTCHours()
  const ms = date.getUTCMinutes()
  const ss = date.getUTCSeconds()
  return `${y}-${td(m)}-${td(d)} ${td(hs)}:${td(ms)}:${td(ss)}`
}

function td(num) {
  return `0${num}`.slice(-2)
}
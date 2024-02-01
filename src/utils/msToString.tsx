export function msToString(ms: number):string {
  var outMs = "00" + ms.toString()
  outMs = outMs.substring(outMs.length - 3)
  return outMs;
}
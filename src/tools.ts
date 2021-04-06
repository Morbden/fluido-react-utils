export const promiseDelay = (time: number) =>
  new Promise((res) => {
    setTimeout(res, time)
  })

export const simplifyId = (
  id: string,
  size: number = 6,
  fill: string | number = '0',
) =>
  '#' +
  id
    .substring(id.length - size)
    .toUpperCase()
    .padStart(size, fill.toString())

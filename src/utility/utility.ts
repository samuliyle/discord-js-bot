export const formatTime = (date: Date, full: boolean = false) => {
  let time = padZero(date.getDate()) + '-'
  time += padZero(date.getMonth() + 1) + '-'
  time += `${date.getFullYear()}`

  if (!full) {
    return time
  }

  time += ' ' + padZero(date.getHours()) + ':'
  time += padZero(date.getMinutes()) + ':'
  time += padZero(date.getSeconds())

  return time
}

// min and max included
export const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export const cleanString = (text: string) => {
  if (typeof text === 'string') {
    return text
      .replace(/`/g, '`' + String.fromCharCode(8203))
      .replace(/@/g, `@ + ${String.fromCharCode(8203)}`)
  }
  return text
}

export const padZero = (number: number) => {
  if (number < 10) {
    return `0${number}`
  }
  return `${number}`
}

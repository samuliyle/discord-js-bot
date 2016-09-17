function formatTime(date, full) {
  let time = '';
  time += date.getDate() < 10 ? `0${date.getDate()}-` : `${date.getDate()}-`;
  const month = date.getMonth() + 1;
  time += month < 10 ? `0${month}-` : `${month}-`;
  time += `${date.getFullYear()}`;
  if (!full) return time;
  time += date.getHours() < 10 ? ` 0${date.getHours()}:` : ` ${date.getHours()}:`;
  time += date.getMinutes() < 10 ? `0${date.getMinutes()}:` : `${date.getMinutes()}:`;
  time += date.getSeconds() < 10 ? `0${date.getSeconds()}` : `${date.getSeconds()}`;
  return time;
}

module.exports = formatTime;

export function tsToTime(unix_timestamp: number):string {

var date = new Date(unix_timestamp * 1000);
var hours = "0" + date.getHours();
var minutes = "0" + date.getMinutes();
var seconds = "0" + date.getSeconds();

var formattedTime = hours.substring(hours.length - 2)+ ':' + minutes.substring(minutes.length - 2) + ':' + seconds.substring(seconds.length - 2);

return formattedTime;
}
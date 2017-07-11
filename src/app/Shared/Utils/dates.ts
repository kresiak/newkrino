import * as moment from "moment"

export function isDateIntervalCompatibleWithNow(datStart: string, datEnd: string) {
    var now = moment()
    var d1 = moment(datStart, 'DD/MM/YYYY HH:mm:ss').startOf('day')
    var d2 = moment(datEnd, 'DD/MM/YYYY HH:mm:ss').add(1, 'day').startOf('day')
    return d1 && d2 && d1.isSameOrBefore(now) && now.isBefore(d2) 
}

export function nowFormated() {
    return moment().format('DD/MM/YYYY HH:mm:ss')
}


import { Pipe, PipeTransform } from '@angular/core';
import * as moment from "moment"

@Pipe({name: 'shortDate'})
export class ShortDatePipe implements PipeTransform {
  transform(date, param) {
    return moment(date, 'DD/MM/YYYY hh:mm:ss').format('LL');    
  }
}
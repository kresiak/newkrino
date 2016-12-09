import { Pipe, PipeTransform } from '@angular/core';
import * as moment from "moment"

@Pipe({name: 'fullDate'})
export class FullDatePipe implements PipeTransform {
  transform(date, param) {
    return moment(date, 'DD/MM/YYYY hh:mm:ss').format('LLLL');    
  }
}
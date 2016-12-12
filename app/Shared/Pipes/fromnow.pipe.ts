import { Pipe, PipeTransform } from '@angular/core';
import * as moment from "moment"

@Pipe({name: 'fromNowDate'})
export class FromNowPipe implements PipeTransform {
  transform(date, param) {
    return moment(date, 'DD/MM/YYYY hh:mm:ss').fromNow();    
  }
}
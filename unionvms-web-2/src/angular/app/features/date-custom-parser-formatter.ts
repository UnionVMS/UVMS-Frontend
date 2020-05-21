import { NgbDateStruct, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {

  readonly DELIMITER = '-';

  parse(value: string): NgbDateStruct | null {
    if (value) {
      const date = value.split(this.DELIMITER);
      return {
        day : parseInt(date[0], 10),
        month : parseInt(date[1], 10),
        year : parseInt(date[2], 10)
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    let formattedDay;
    let formattedMonth;
    if (date) {
      formattedDay = date.day < 10 ? `0${date.day}` : date.day;
      formattedMonth = date.month < 10 ? `0${date.month}` : date.month;
    }
    return date ? formattedDay + this.DELIMITER + formattedMonth + this.DELIMITER + date.year : '';
  }
}

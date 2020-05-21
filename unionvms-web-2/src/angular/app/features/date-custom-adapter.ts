import {Injectable} from '@angular/core';
import { NgbDateAdapter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';

/**
 * This Service handles how the date is represented in scripts.
 */
@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {

  readonly DELIMITER = '-';

  fromModel(value: string | null): NgbDateStruct | null {
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

  toModel(date: NgbDateStruct | null): string | null {
    let formattedDay;
    let formattedMonth;
    if (date) {
      formattedDay = date.day < 10 ? `0${date.day}` : date.day;
      formattedMonth = date.month < 10 ? `0${date.month}` : date.month;
    }
    return date ? formattedDay + this.DELIMITER + formattedMonth + this.DELIMITER + date.year : null;
  }
}

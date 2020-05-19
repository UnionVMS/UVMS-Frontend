import { Component, OnInit, Input, forwardRef, ViewChild, AfterViewInit, Injector, Self, Optional } from '@angular/core';
import { NgbTimeStruct, NgbDateStruct, NgbPopoverConfig, NgbPopover, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DateTimeModel } from './date-time.model';
import { noop } from 'rxjs';
import { faCalendar,  faClock } from '@fortawesome/free-regular-svg-icons';

@Component({
    selector: 'app-date-time-picker',
    templateUrl: './date-time-picker.component.html',
    styleUrls: ['./date-time-picker.component.scss'],
    providers: [
        DatePipe,
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DateTimePickerComponent),
            multi: true
        }
    ]
})
export class DateTimePickerComponent implements ControlValueAccessor, OnInit, AfterViewInit {
    @Input()
    dateString: string;

    @Input()
    inputDatetimeFormat = 'M/d/yyyy H:mm:ss';
    @Input()
    hourStep = 1;
    @Input()
    minuteStep = 15;
    @Input()
    secondStep = 30;
    @Input()
    seconds = true;

    @Input()
    disabled = false;

    public showTimePickerToggle = false;

    public datetime: DateTimeModel = new DateTimeModel();
    public firstTimeAssign = true;

    @ViewChild(NgbDatepicker)
    private dp: NgbDatepicker;

    @ViewChild(NgbPopover)
    public popover: NgbPopover;

    private onTouched: () => void = noop;
    public onChange: (_: any) => void = noop;

    public ngControl: NgControl;
    faCalendar = faCalendar;
    faClock = faClock;

    constructor(private config: NgbPopoverConfig, @Self() @Optional() private inj: Injector ) {
        config.autoClose = 'outside';
        config.placement = 'auto';
    }

    ngOnInit(): void {
        this.ngControl = this.inj.get(NgControl);
    }

    ngAfterViewInit(): void {
        this.popover.hidden.subscribe($event => {
            this.showTimePickerToggle = false;
        });
    }

    writeValue(newModel: string) {
        if (newModel) {
            this.datetime = Object.assign(this.datetime, DateTimeModel.fromLocalString(newModel));
            this.dateString = newModel;
            this.setDateStringModel();
        } else {
            this.datetime = new DateTimeModel();
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    toggleDateTimeState($event) {
        this.showTimePickerToggle = !this.showTimePickerToggle;
        $event.stopPropagation();
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onInputChange($event: any) {
        const value = $event.target.value;
        const dt = DateTimeModel.fromLocalString(value);

        if (dt) {
            this.datetime = dt;
            this.setDateStringModel();
        } else if (value.trim() === '') {
            this.datetime = new DateTimeModel();
            this.dateString = '';
            this.onChange(this.dateString);
        } else {
              this.onChange(value);
        }
    }

    onDateChange($event: string | NgbDateStruct) {
        // if ($event.year){
        //   $event = `${$event.year}-${$event.month}-${$event.day}`;
        // }

        // const date = DateTimeModel.fromLocalString($event);

        // if (!date) {
        //     this.dateString = this.dateString;
        //     return;
        // }

        // if (!this.datetime) {
        //     this.datetime = date;
        // }

        // this.datetime.year = date.year;
        // this.datetime.month = date.month;
        // this.datetime.day = date.day;

        // this.dp.navigateTo({ year: this.datetime.year, month: this.datetime.month });
        // console.log('test');
        // this.setDateStringModel();
    }

    onTimeChange(event: NgbTimeStruct) {
        this.datetime.hour = event.hour;
        this.datetime.minute = event.minute;
        this.datetime.second = event.second;

        this.setDateStringModel();
    }

    setDateStringModel() {
        this.dateString = this.datetime.toString();

        if (!this.firstTimeAssign) {
            this.onChange(this.dateString);
        } else {
            // Skip very first assignment to null done by Angular
            if (this.dateString !== null) {
                this.firstTimeAssign = false;
            }
        }
    }

    inputBlur($event) {
        this.onTouched();
    }
}


angular.module('unionvmsWeb').directive('datepickerInput', ['$compile',function($compile) {
	return {
		restrict: 'E',
		replace: true,
        controller: 'datepickerInputCtrl',
		scope: {
            model : '=',
            placeholder : '@',
            ngDisabled : '=',
            ngRequired : '=',
            ngChangeCallback : '=', //calback onchange
            time: '@', //use timepicker?
            minDate : '=', //should be on format "YYYY-MM-DD HH:mm:ss Z"
            maxDate : '=', //should be on format "YYYY-MM-DD HH:mm:ss Z"
            inputFieldId: '@',
            updateWhen: '@',
            fullscreenLocation: '='
		},
		templateUrl: 'directive/common/datepickerInput/datepickerInput.html',
		link: function(scope, element, attrs, ngModel) {
            //Add input name if name attribute exists
            var name = attrs.name;
            scope.element = element;
            
            if(name) {
                element.find('input').attr('name', name);
                element.removeAttr("name");
                $compile(element)(scope);
            }
            
            //Add a random id to the input element
            element.find('input').attr('id', scope.inputFieldId);

            //Create dateTimePicker and save on scope
            scope.dateTimePicker = jQuery("#" +scope.inputFieldId).datetimepicker(scope.options);

            if(scope.fullscreenLocation){
                element.ready(function () {
                    jQuery('#' + scope.datepickerId).addClass('fullscreen-datepicker');  
                    jQuery('#' + scope.datepickerId).appendTo(scope.fullscreenLocation);
                });
            }
        }
	};
}]);

angular.module('unionvmsWeb')
    .controller('datepickerInputCtrl',['$scope', 'dateTimeService','globalSettingsService', function($scope, dateTimeService, globalSettingsService){

        var iso8601Dates = globalSettingsService.getDateFormat() === 'YYYY-MM-DD HH:mm:ss';

        //Formats used by momentjs and the picker
        var FORMATS = {
            WITH_TIMEZONE : {
                MOMENTJS : 'YYYY-MM-DD HH:mm:ss Z',
            },
            YMD : {
                MOMENTJS : 'YYYY-MM-DD',
                PICKER : iso8601Dates ? 'Y-m-d' : 'y/m/d',
            },
            YMDHM : {
                MOMENTJS : 'YYYY-MM-DD HH:mm:ss',
                PICKER : iso8601Dates ? 'Y-m-d H:i:s' : 'y/m/d H:i:s',
            }
        };
        $scope.FORMATS = FORMATS; //make them accessible by the formatters/parsers

        //Format used for the defaultDate option
        var defaultDateFormat = FORMATS.YMD;

        var init = function(){
            //Use time?
            $scope.useTime = false;
            if(typeof $scope.time === 'string' && $scope.time.toLowerCase() === 'true'){
                $scope.useTime = true;
                defaultDateFormat = FORMATS.YMDHM;
            }

            if (angular.isUndefined($scope.inputFieldId)) {
                // Create a unique id for the input and the datepicker element.
                $scope.inputFieldId = generateGUID();
            }

            $scope.datepickerId = "picker-" +$scope.inputFieldId;

            //Set options
            setStartOptions();
        };

        //Generate guid
        function generateGUID() {
          function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
          }
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
        }

        //Picker options
        $scope.options = {};

        //Set options for the picker
        function setStartOptions(){
            //Set picker options
            var dateFormat = FORMATS.YMD.PICKER;
            //DateTimePicker options
            $scope.options = {
                id: $scope.datepickerId,
                datepicker:true,
                timepicker:false,
                format : dateFormat,
                closeOnDateSelect: true,
                dayOfWeekStart:1, //monday
            };
            
    		$scope.updateWhen = angular.isDefined($scope.updateWhen) ? $scope.updateWhen : 'blur';

            //Set default date to current date/time in UTC
            var userTime = dateTimeService.formatAccordingToUserSettings(moment.utc());
            $scope.userTime = moment(userTime, globalSettingsService.getDateFormat()).format(FORMATS.YMDHM.MOMENTJS);

            $scope.options.defaultDate = moment(userTime, globalSettingsService.getDateFormat()).format(FORMATS.YMD.MOMENTJS);

            if($scope.useTime){
                $scope.options.timepicker = true;
                $scope.options.format = FORMATS.YMDHM.PICKER;
                $scope.options.step = 5;
                $scope.options.roundTime = 'ceil';
                //Set default date with time also
                $scope.options.defaultDate = userTime;
                $scope.options.closeOnDateSelect = false;
            }
        }

        //Update picker options
        var updateOptions = function(newOptions){
            if(angular.isDefined(newOptions)){
                $.each(newOptions, function(key, val){
                    $scope.options[key] = val;
                });
            }
        	$scope.dateTimePicker.datetimepicker($scope.options);
        };

        //Open on button click
        $scope.open = function () {
            $scope.dateTimePicker.trigger("open.xdsoft");
        };

        //Call callback  on change
        $scope.onChange = function(){
            //Call callback
            if(angular.isDefined($scope.ngChangeCallback)){
                $scope.ngChangeCallback($scope.model);
            }
        };

        // Watch changes of the maxDate
        $scope.$watch('maxDate', function(maxDate) {
            var newMaxDate = '2150-12-31',
                newDefaultDate;
            if(angular.isDefined(maxDate)){
                var maxDateMoment = moment.utc(maxDate, FORMATS.WITH_TIMEZONE.MOMENTJS);
                var prevDayMoment = moment.utc(maxDate, FORMATS.WITH_TIMEZONE.MOMENTJS).subtract(1, 'days');
                if($scope.useTime){
                    //newMaxDate be same day if timepicker is used
                    newMaxDate = maxDateMoment.format(FORMATS.YMD.MOMENTJS);
                    newDefaultDate = maxDateMoment.format(defaultDateFormat.MOMENTJS);
                }else{
                    //newMinDate should be prev day if timepicker isn't used
                    newMaxDate = prevDayMoment.format(FORMATS.YMD.MOMENTJS);
                    newDefaultDate = prevDayMoment.format(defaultDateFormat.MOMENTJS);
                }

                //MaxDate before today?
                var nowMoment = moment().utcOffset(globalSettingsService.getTimezone());
                if(maxDateMoment.isBefore(nowMoment)){
                    newDefaultDate = maxDateMoment.format(defaultDateFormat.MOMENTJS);
                }else{
                    newDefaultDate = nowMoment.format(defaultDateFormat.MOMENTJS);
                }
            }else{
                newDefaultDate = moment.utc().format(defaultDateFormat.MOMENTJS);
            }

            newDefaultDate = dateTimeService.formatAccordingToUserSettings(newDefaultDate);
            newMaxDate = dateTimeService.formatAccordingToUserSettings(maxDate);
            if (newMaxDate !== undefined) {
                newMaxDate = newMaxDate.split(" ")[0];
            }

            if (newDefaultDate && !$scope.useTime) {
                newDefaultDate = newDefaultDate.split(" ")[0];
            }

            //Update max date and default date
            var newOptions = {
                maxDate: newMaxDate,
                formatDate: FORMATS.YMD.PICKER,
                defaultDate : newDefaultDate,
                format: defaultDateFormat.PICKER
            };
            updateOptions(newOptions);
        });


        //Watch changes of the minDate
        $scope.$watch('minDate', function(minDate) {
            var newMinDate = '1970-01-01',
                newDefaultDate;
            if(angular.isDefined(minDate)){
                var minDateMoment = moment.utc(minDate, FORMATS.WITH_TIMEZONE.MOMENTJS);
                var nextDayMoment = moment.utc(minDate, FORMATS.WITH_TIMEZONE.MOMENTJS).add(1, 'days');
                if($scope.useTime){
                    //newMinDate be same day if timepicker is used
                    newMinDate = minDateMoment.format(FORMATS.YMD.MOMENTJS);
                    newDefaultDate = minDateMoment.format(defaultDateFormat.MOMENTJS);
                }else{
                    //newMinDate should be next day if timepicker isn't used
                    newMinDate = nextDayMoment.format(FORMATS.YMD.MOMENTJS);
                    newDefaultDate = nextDayMoment.format(defaultDateFormat.MOMENTJS);
                }
            }else{
                newDefaultDate = moment.utc().format(defaultDateFormat.MOMENTJS);
            }

            newDefaultDate = dateTimeService.formatAccordingToUserSettings(newDefaultDate);
            newMinDate = dateTimeService.formatAccordingToUserSettings(minDate);
            if (newMinDate !== undefined) {
                newMinDate = newMinDate.split(" ")[0];
            }

            if (newDefaultDate && !$scope.useTime) {
                newDefaultDate = newDefaultDate.split(" ")[0];
            }

            //Update min date and default date
            var newOptions = {
                minDate: newMinDate,
                formatDate: FORMATS.YMD.PICKER,
                defaultDate : newDefaultDate,
                format: defaultDateFormat.PICKER
            };
            updateOptions(newOptions);
        });
        
        var cleanup = function(){
            //Remove the datepicker from the DOM
            jQuery("#" +$scope.datepickerId).remove();

            //Remove event listeners from input field
            jQuery("#" +$scope.inputFieldId).off();
        };

        $scope.$on('$destroy', function() {
            cleanup();
        });

        init();
}]);


//Format the model and view values
//The model is updated on the format 'YYYY-MM-DD HH:mm:ss Z' and the view on the format 'YYYY-MM-DD HH:mm' or 'YYYY-MM-DD'
angular.module('unionvmsWeb').directive('datePickerFormatter',['dateTimeService','$timeout', 'globalSettingsService', function(dateTimeService, $timeout, globalSettingsService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            var useTime = false;
            if(typeof scope.time === 'string' && scope.time.toLowerCase() === 'true'){
                useTime = true;
            }
            //Formats used by momentjs
            var TIMEZONE_FORMAT = scope.FORMATS.WITH_TIMEZONE.MOMENTJS;
            var YMD_FORMAT = scope.FORMATS.YMD.MOMENTJS;
            var YMDHM_FORMAT = scope.FORMATS.YMDHM.MOMENTJS;

            function isBlank(str) {
                return !str || (typeof str === 'string' && str.trim().length === 0);
            }

            var toView = function (newValue) {
                if (!isBlank(newValue) && !moment(newValue, "YYYY-MM-DD HH:mm:ss Z", true).isValid()) {
                    ctrl.$setValidity('format', false);
                    return newValue;
                }
                else {
                    ctrl.$setValidity('format', true);
                }

                //Undefined or empty string?
                if(typeof newValue !== 'string' || newValue.trim().length === 0){
                    newValue = '';
                }
                else{
                    ctrl.$setDirty(true);
                    //Parse UTC date to viewValue
                    newValue = dateTimeService.utcToUserTimezone(newValue, globalSettingsService.getDateFormat());
                    if(!useTime){
                        newValue = moment(newValue, YMDHM_FORMAT).format(YMD_FORMAT);
                    }
                }
                return newValue;
            };

            var toModel = function (newValue) {
                if (!isBlank(newValue) && !moment(newValue, globalSettingsService.getDateFormat(), true).isValid()) {
                    ctrl.$setValidity('format', false);
                    return newValue;
                }
                else {
                    ctrl.$setValidity('format', true);
                }

                ctrl.$setDirty(true);
                if(angular.isDefined(newValue)){
                    //Add UTC timezone (+00:00)
                    newValue = dateTimeService.formatUTCDateWithTimezone(newValue, globalSettingsService.getDateFormat());
                    //Only set model and call callback if newValue is valid
                    if(newValue.indexOf("Invalid date") >= 0){
                        newValue = undefined;
                    }
                }else{
                    newValue = undefined;
                }
                //TODO: Fix without using a timeout
                //parse must be set to valid to be able to set model value to undefined after clearing the input
                if(newValue === undefined){
                    $timeout(function(){
                        ctrl.$setValidity('parse', true);
                        ctrl.$setValidity('minDate', true);
                        ctrl.$setValidity('maxDate', true);
                    }, 10);
                }
                return newValue;
            };

            ctrl.$formatters.unshift(toView);
            ctrl.$parsers.unshift(toModel);
        }
    };
}]);

/*VALIDATORS*/
//Date must be after minDate
//Validator with name min-date already exists in Bootstrap so use other name here
angular.module('unionvmsWeb').directive('datePickerInputMinDate', ['dateTimeService',function(dateTimeService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            function updateValidity(date, minDate) {
                var valid = true;
                if(date !== undefined && minDate !== undefined && date.trim().length > 0 && minDate.trim().length > 0){
                    var dateMoment = moment.utc(date, scope.FORMATS.WITH_TIMEZONE.MOMENTJS);
                    var minDateMoment = moment.utc(minDate, scope.FORMATS.WITH_TIMEZONE.MOMENTJS);
                    valid = dateMoment.isAfter(minDateMoment);
                }
                ctrl.$setValidity('minDate', valid );
            }
            scope.$watch('minDate', function(newValue) {
                updateValidity(scope.model, newValue);
            });

            var checkDate = function(currentDate) {
                updateValidity(currentDate, scope.minDate);
                return currentDate;
            };
            ctrl.$parsers.push(checkDate);
            ctrl.$formatters.push(checkDate);
        }
    };
}]);

//Date must be before maxDate
//Validator with name max-date already exists in Bootstrap so use other name here
angular.module('unionvmsWeb').directive('datePickerInputMaxDate',['dateTimeService', function(dateTimeService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            function updateValidity(date, maxDate) {
                var valid = true;
                if(date !== undefined && maxDate !== undefined && date.trim().length > 0 && maxDate.trim().length > 0){
                    var dateMoment = moment.utc(date, scope.FORMATS.WITH_TIMEZONE.MOMENTJS);
                    var maxDateMoment = moment.utc(maxDate, scope.FORMATS.WITH_TIMEZONE.MOMENTJS);
                    valid = dateMoment.isBefore(maxDateMoment);
                }
                ctrl.$setValidity('maxDate', valid );
            }

            scope.$watch('maxDate', function(newValue) {
                updateValidity(scope.model, newValue);
            });

            var checkDate = function(currentDate) {
                updateValidity(currentDate, scope.maxDate);
                return currentDate;
            };
            ctrl.$parsers.push(checkDate);
            ctrl.$formatters.push(checkDate);
        }
    };
}]);

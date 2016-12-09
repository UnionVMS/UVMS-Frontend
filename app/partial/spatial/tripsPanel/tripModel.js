/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @memberof unionvmsWeb
 * @ngdoc model
 * @name Trip
 * @param locale {service} angular locale service
 * @param unitConversionService {service} unit conversion service
 * @attr {Number} id - A property number that will be the trip id
 * @attr {Object} overview - A property object that will contain the main events dates and locations(departure,arrival and landing)
 * @attr {Object} reports - A property object that will contain the report messages
 * @attr {Object} tripVessel - A property object that will be the vessel details
 * @attr {Object} tripRoles - A property object that will contain the roles
 * @attr {Object} cronology - A property object that will contain the cronology of trips related to the current trip
 * @attr {Object} catchDetails - A property object that will be the catch details
 * @attr {Object} messageCount - A property object that will contain the message types count
 * @description
 *  A model to store all the data related to a trip
 */
angular.module('unionvmsWeb').factory('Trip',function(locale,unitConversionService) {

    /**
     * Trip constructor
     * 
     * @memberof Trip
     * @public
	 * @alias Trip
     * @param {Number} id - current trip id
     */
	function Trip(id){
		this.id = id;
	    this.overview = undefined;
		this.reports = undefined;
		this.tripVessel = undefined;
		this.tripRoles = undefined;
		this.cronology = undefined;
		this.catchDetails = undefined;
		this.messageCount = undefined;
	}

    /**
     * Load the model with the trip data
     * 
     * @memberof Trip
     * @public
	 * @alias Trip
     * @param {String} type - current trip object
     * @param {Object} data - data related to the trip
     */
	Trip.prototype.fromJson = function(type,data){
		switch(type){
			case 'reports':
				loadReports(this,data);
				break;
			case 'vessel':
				loadVesselRoles(this,data);
				break;
			case 'cronology':
				loadCronology(this,data);
				break;
			case 'catch':
                loadCatch(this,data);
				break;
			case 'messageCount':
				this.messageCount = data;
				break;
		}
	};

    /**
     * Load the trip overview and the report messages into the model
     * 
     * @memberof Trip
     * @private
     * @param {Object} self - current trip object
     * @param {Object} data - reports and trip overview data
     */
	var loadReports = function(self,data){
        loadOverview(self,data.summary);
		//TODO MAP geometries
		loadReportMessages(self,data.activityReports); 
	};

    /**
     * Load the trip overview into the model
     * 
     * @memberof Trip
     * @private
     * @param {Object} self - current trip object
     * @param {Object} data - trip overview data
     */
    var loadOverview = function(self,data){
        if(angular.isDefined(data)){
            if(angular.isDefined(data.DEPARTURE)){
                data.DEPARTURE.date = unitConversionService.date.convertToUserFormat(data.DEPARTURE.date);
            }
            if(angular.isDefined(data.ARRIVAL)){
                data.ARRIVAL.date = unitConversionService.date.convertToUserFormat(data.ARRIVAL.date);
            }
            if(angular.isDefined(data.LANDING)){
                data.LANDING.date = unitConversionService.date.convertToUserFormat(data.LANDING.date);
            }
        }
        self.overview = data;
    };

    /**
     * Load the report messages into the model
     * 
     * @memberof Trip
     * @private
     * @param {Object} self - current trip object
     * @param {Object} activityReports - activity reports data
     */
	var loadReportMessages = function(self,activityReports){
        self.reports = [];

        //one main node per activity report
        angular.forEach(activityReports,function(report){
            var reportItem = {};
            reportItem.type = locale.getString('activity.activity_type_' + report.activityType.toLowerCase());
            reportItem.nodes = [];

            if(!angular.isDefined(report.delimitedPeriod) || report.delimitedPeriod.length === 0){
                report.delimitedPeriod = [{}];
            }

            //one sub node per period
            angular.forEach(report.delimitedPeriod,function(subreport){
                var subreportItem = {};

                subreportItem.type = (report.correction ? locale.getString('fa_report_document_type_correction') + ': ' : '') + locale.getString('activity.activity_type_' + report.activityType.toLowerCase()) + ' (' + locale.getString('activity.fa_report_document_type_' + report.faReportDocumentType.toLowerCase()) + ')';

                subreportItem.date = getReportDate(report.faReportAcceptedDateTime,subreport.startDate,subreport.endDate);

                if(angular.isDefined(report.locations) && report.locations.length > 0){
                    subreportItem.location = '';
                    angular.forEach(report.locations,function(location){
                        subreportItem.location += location;
                    });
                }
                subreportItem.reason = locale.getString('activity.report_reason_' + report.reason.toLowerCase());
                subreportItem.remarks = getRemarks(report);

                subreportItem.corrections = report.correction;
                subreportItem.detail = true;
                
                reportItem.nodes.push(subreportItem);
            });

            self.reports.push(reportItem);
        });
    };

    /**
     * Builds the remarks column to be displayed in reports panel
     * 
     * @memberof Trip
     * @private
     * @param {Object} report - report message
     */
	var getRemarks = function(report){
        var remarks = '';

        if(report.activityType === 'DEPARTURE' || report.activityType === 'FISHING_OPERATION'){
            if(angular.isDefined(report.fishingGears)){
                remarks = report.fishingGears[0].gearTypeCode;
            }
        }else{
            remarks = unitConversionService.date.convertToUserFormat(report.faReportAcceptedDateTime);
        }

        switch(report.activityType){
            case 'DEPARTURE':
                remarks += ' (gear)';
                break;
            case 'FISHING_OPERATION':
                remarks += ' (gear used)';
                break;
            case 'ARRIVAL':
                if(report.faReportDocumentType === 'DECLARATION'){
                    remarks += ' (est. time landing)';
                }else if(report.faReportDocumentType === 'NOTIFICATION'){
                    remarks += ' (gear used)';
                }
                break;
            case 'LANDING':
                remarks += ' (end time landing)';
                break;
            case 'ENTRY':
            case 'EXIT':
            case 'RELOCATION':
                remarks += ' (est. time)';
                break;
            case 'TRANSHIPMENT':
                if(report.faReportDocumentType === 'DECLARATION'){
                    remarks += ' (est. time transhipment)';
                }else if(report.faReportDocumentType === 'NOTIFICATION'){
                    remarks += ' (est. time)';
                }
                break;
        }

        return remarks;
    };

    /**
     * Build the date column to be displayed in reports panel
     * 
     * @memberof Trip
     * @private
     * @param {String} acceptedDateTime - accepted report message date time
     * @param {String} startDate - report message start date time
     * @param {String} endDate - report message end date time
     */
    var getReportDate = function(acceptedDateTime,startDate,endDate){
        var date;
        if(angular.isDefined(startDate) && angular.isDefined(endDate)){
            startDate = unitConversionService.date.convertToUserFormat(startDate);
            endDate = unitConversionService.date.convertToUserFormat(endDate);
            
            if(startDate === endDate){
                date = startDate;
            }else{
                var startDateArr = startDate.split(' ');
                var endDateArr = endDate.split(' ');

                if(startDateArr[0] === endDateArr[0]){
                    date = startDateArr[0] + ' ' + startDateArr[1] + '-' + endDateArr[1];
                }else{
                    date = startDate + ' - ' + endDate;
                }
            }
        }else{
            acceptedDateTime = unitConversionService.date.convertToUserFormat(acceptedDateTime);
            date = acceptedDateTime;
        }

        return date;
    };

    /**
     * Load the vessel details and the trip roles into the model
     * 
     * @memberof Trip
     * @private
     * @param {Object} self - current trip object
     * @param {Object} data - vessel and roles data
     */
	var loadVesselRoles = function(self,data){
		self.tripVessel = angular.copy(data);
		delete self.tripVessel.contactPersons;

		angular.forEach(data.contactPersons,function(value, key) {
			value.type = value.title + ' ' + value.givenName + ' ' + value.middleName + ' ' + value.familyName;
		});
		self.tripRoles = data.contactPersons;
	};

    /**
     * Load the trip cronology into the model
     * 
     * @memberof Trip
     * @private
     * @param {Object} self - current trip object
     * @param {Object} data - cronology data
     */
	var loadCronology = function(self,data){
		if(angular.isDefined(data.previousTrips) && data.previousTrips.length > 0){
			data.previousTrips = data.previousTrips.reverse();
		}
		if(angular.isDefined(data.nextTrips) && data.nextTrips.length > 0){
			data.nextTrips = data.nextTrips.reverse();
		}

		self.cronology = data;
	};

    /**
     * Load the catch details into the model
     * 
     * @memberof Trip
     * @private
     * @param {Object} self - current trip object
     * @param {Object} data - catch details data
     */
    var loadCatch = function(self,data){

        angular.forEach(data, function(type,typeName){
            type.title = locale.getString('activity.catch_panel_title_' + typeName);
            type.caption = locale.getString('activity.catch_panel_caption_' + typeName) + ' ' + type.total + ' kg';

            if(angular.isDefined(type.speciesList) && type.speciesList.length > 0){
                var colors = palette('tol-rainbow', type.speciesList.length);
                angular.forEach(type.speciesList, function(value,key){
                    type.speciesList[key].color = '#' + colors[key];
                    type.speciesList[key].tableColor = {'background-color': tinycolor('#' + colors[key]).setAlpha(0.7).toRgbString()};
                });
            }
        });

		self.catchDetails = data;
	};

	return Trip;
});

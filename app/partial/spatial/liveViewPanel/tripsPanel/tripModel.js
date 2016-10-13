angular.module('unionvmsWeb').factory('Trip',function(locale) {

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

	Trip.prototype.fromJson = function(type,data){
		switch(type){
			case 'reports':
				loadReports(data);
				break;
			case 'vessel':
				loadVesselRoles(data);
				break;
			case 'cronology':
				loadCronology(data);
				break;
			case 'catch':
				this.catchDetails = data;
				break;
			case 'messageCount':
				this.messageCount = data;
				break;
		}
	};

	var loadReports = function(data){
		this.overview = data.summary;
		//TODO MAP geometries
		this.reports = loadReportMessages(data.activityReports); 
	};

	var loadReportMessages = function(activityReports){
        this.reports = [];
        angular.forEach(activityReports,function(report){
            var reportItem = {};
            reportItem.type = locale.getString('activity.activity_type_' + report.activityType.toLowerCase());
            reportItem.nodes = [];

            if(!angular.isDefined(report.delimitedPeriod) || report.delimitedPeriod.length === 0){
                report.delimitedPeriod = [{}];
            }

            angular.forEach(report.delimitedPeriod,function(subreport){
                var subreportItem = {};

                subreportItem.type = (report.correction ? 'Correction: ' : '') + locale.getString('activity.activity_type_' + report.activityType.toLowerCase()) + ' (' + locale.getString('spatial.fa_report_document_type_' + report.faReportDocumentType.toLowerCase()) + ')';

                subreportItem.date = getReportDate(report.faReportAcceptedDateTime,subreport.startDate,subreport.endDate);

                if(angular.isDefined(report.locations) && report.locations.length > 0){
                    subreportItem.location = '';
                    angular.forEach(report.locations,function(location){
                        subreportItem.location += location;
                    });
                }
                subreportItem.reason = locale.getString('activity.report_reason_' + report.reason.toLowerCase());;
                subreportItem.remarks = getRemarks(report);

                subreportItem.corrections = report.correction;
                subreportItem.detail = true;
                
                reportItem.nodes.push(subreportItem);
            });

            this.reports.push(reportItem);
        });
    };

	var getRemarks = function(report){
        var remarks;

        if(report.activityType === 'DEPARTURE' || report.activityType === 'FISHING_OPERATION'){
            remarks = report.fishingGears[0].gearTypeCode;
        }else{
            remarks = report.faReportAcceptedDateTime;
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

    var getReportDate = function(acceptedDateTime,startDate,endDate){
        var date;
        if(angular.isDefined(startDate) && angular.isDefined(endDate)){
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
            date = acceptedDateTime;
        }

        return date;
    };

	var loadVesselRoles = function(data){
		this.tripVessel = data;
		delete this.tripVessel.contactPersons;

		angular.forEach(data.contactPersons,function(value, key) {
			value.code = value.id = key;
			value.text = value.title + ' ' + value.givenName + ' ' + value.middleName + ' ' + value.familyName;
		});
		this.tripRoles = data.contactPersons;
	};

	var loadCronology = function(data){
		if(angular.isDefined(data.previousTrips) && data.previousTrips.length > 0){
			data.previousTrips = data.previousTrips.reverse();
		}
		if(angular.isDefined(data.nextTrips) && data.nextTrips.length > 0){
			data.nextTrips = data.nextTrips.reverse();
		}

		this.cronology = data;
	};

	return Trip;
});
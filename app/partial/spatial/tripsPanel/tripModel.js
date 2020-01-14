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
angular.module('unionvmsWeb').factory('Trip',function($http,locale,unitConversionService,tripReportsTimeline,fishingActivityService, tripDataHelperService) {

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
        this.mapData = undefined;
        this.specieColor = undefined;
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
            case 'mapData':
                loadMapData(this, data);
                break;
            case 'catchEvolution':
                tripDataHelperService.transformCatchEvolutionData(this, data);
                break;
        }
    };
	/**
	 * Load the map data of a trip into the model
	 * 
	 * @memberof Trip
	 * @private
	 * @param {Object} self - current trip object
     * @param {Object} data - reports and trip overview data
	 */
    var loadMapData = function(self, data){
        self.mapData = data;
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
     * Get the translated FA report document type for an activity
     *
     * @memberof Trip
     * @private
     * @param {Object} node - current node
     * @returns {String] The translate FA report doc string
     */
    var getReportItemDocType = function (node) {
        var type = '';
        if (node.correction){
            switch (parseInt(node.purposeCode)) {
                case 5:
                    type = locale.getString('activity.fa_report_document_type_correction');
                    break;
                case 1:
                    type = locale.getString('activity.fa_report_document_type_deleted');
                    node.correction = false;
                    break;
                case 3:
                    type = locale.getString('activity.fa_report_document_type_canceled');
                    node.correction = false;
                    break;
            }

            type += ': ';
        }
        return type;
    };

    /**
     * Load the report messages into the model
     * 
     * @memberof Trip
     * @private
     * @param {Object} node - current node
     */
    var loadActivityReportItem = function(node){
        var reportItem = {};
        reportItem.srcType = node.activityType;

        reportItem.type = getReportItemDocType(node) + locale.getString('activity.activity_type_' + node.activityType.toLowerCase()) + ' (' + locale.getString('activity.fa_report_document_type_' + node.faReportDocumentType.toLowerCase()) + ')';

        reportItem.documentType = node.faReportDocumentType.toLowerCase();

        reportItem.date = getReportDate(node);

        if(angular.isDefined(node.locations) && node.locations.length > 0){
            reportItem.location = '';
            angular.forEach(node.locations,function(location){
                reportItem.location += location;
            });
        }

        reportItem.reason = node.reason;
        reportItem.remarks = getRemarks(node);

        reportItem.corrections = node.correction;
        reportItem.detail = true;

        reportItem.id = node.fishingActivityId;
        reportItem.faUniqueReportID = node.faUniqueReportID;
        reportItem.repId = node.faReportID;

        if(angular.isDefined(node.faReferenceID)){
            var mainNode = _.find(this, function(rep){
                return rep.faUniqueReportID === node.faReferenceID;
            });

            if (angular.isDefined(mainNode)){
                mainNode.nodes = mainNode.nodes || [];
                mainNode.nodes.push(reportItem);
            } else {
                _.each(this, function(item){
                   var tempRefNode = _.find(item.nodes, function(rep){
                       return rep.faUniqueReportID === node.faReferenceID;
                   });

                   if (angular.isDefined(tempRefNode)){
                       item.nodes.push(reportItem);
                   }
                });
            }
        }else{
            this.push(reportItem);
        }
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
        var reports = [];
        tripReportsTimeline.reset();
        self.reports = [];

        var mainNodes = _.filter(activityReports, function(rep){ return rep.faReferenceID === undefined; });
        var subNodes = _.filter(activityReports, function(rep){ return rep.faReferenceID !== undefined; });

        angular.forEach(mainNodes,loadActivityReportItem,reports);
        reports = _.sortBy(reports, function(node){ return moment(node.date).unix(); });

        angular.forEach(subNodes,loadActivityReportItem,reports);

        angular.forEach(reports,function(rep){
            if(angular.isDefined(rep.nodes)){
                rep.nodes = _.sortBy(rep.nodes, function(node){ return moment(node.date).unix(); });
                rep.nodes = rep.nodes.reverse();
                
                //Final subnode reordering so that the last correction is displayed as a main node
                var tmpMainNode = rep.nodes.splice(0, 1)[0];
                tmpMainNode.nodes = rep.nodes;
                var lastSubNode = _.clone(rep);
                delete lastSubNode.nodes;
                tmpMainNode.nodes.push(lastSubNode);
                angular.copy(tmpMainNode, rep);
                rep.correction = true;
            }

            tripReportsTimeline.reports.push(rep);
        });

        self.reports = reports;
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
            if (report.faReportDocumentType === 'NOTIFICATION'){
                remarks = unitConversionService.date.convertToUserFormat(report.occurence);
            } else {
                remarks = unitConversionService.date.convertToUserFormat(report.faReportAcceptedDateTime);
            }
        }

        switch(report.activityType){
            case 'DEPARTURE':
                remarks += ' ' + locale.getString('activity.trip_summary_gear');
                break;
            case 'FISHING_OPERATION':
                remarks += ' ' + locale.getString('activity.trip_summary_gear_used');
                break;
            case 'ARRIVAL':
                remarks += ' ' + locale.getString('activity.trip_summary_est_time_arr');
                break;
            case 'LANDING':
                remarks += ' ' + locale.getString('activity.trip_summary_time_land');
                break;
            case 'ENTRY':
            case 'EXIT':
            case 'RELOCATION':
                remarks += ' ' + locale.getString('activity.trip_summary_est_time');
                break;
            case 'TRANSHIPMENT':
                if(report.faReportDocumentType === 'DECLARATION'){
                    remarks += ' ' + locale.getString('activity.trip_summary_est_time_trans');
                }else if(report.faReportDocumentType === 'NOTIFICATION'){
                    remarks += ' ' + locale.getString('activity.trip_summary_est_time');
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
    var getReportDate = function(node){
        var date;

        if(node.faReportDocumentType.toLowerCase() === 'declaration'){
            if(node.occurence){
                date = unitConversionService.date.convertToUserFormat(node.occurence);
            }else if(node.delimitedPeriod && node.delimitedPeriod.length){
                if(node.delimitedPeriod[0].startDate){
                    date = unitConversionService.date.convertToUserFormat(node.delimitedPeriod[0].startDate);
                }else if(node.delimitedPeriod[0].endDate){
                    date = unitConversionService.date.convertToUserFormat(node.delimitedPeriod[0].endDate);
                }else{
                    date = unitConversionService.date.convertToUserFormat(node.faReportAcceptedDateTime);
                }
            }else{
                date = unitConversionService.date.convertToUserFormat(node.faReportAcceptedDateTime);
            }
        }else{
            date = unitConversionService.date.convertToUserFormat(node.faReportAcceptedDateTime);
        }

        /*if(angular.isDefined(startDate) && angular.isDefined(endDate)){
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
        }*/

        return date;
    };

    /**
     * Adds extra attributes to attrOrder
     * 
     * @memberof Trip
     * @private
     * @param {Object} data - A reference to the data to be loaded in the attrOrder
     * @param {Array} attrOrder - Array with the attribute order
     * @param {Number} attrIdx - Current index in the attrOrder
     * @alias addExtraDetails
     * @returns {Object} data to be displayed in the fa details panel
     */
    var addExtraDetails = function(data,attrOrder,attrIdx){
        var finalData = {};
        angular.forEach(data, function(value){
            finalData[value.schemeId] = value.id;

            attrOrder.push({
                idx: attrIdx,
                id: value.schemeId,
                type: 'string'
            });
            attrIdx++;
        });

        return finalData;
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

        if(data){

            var vesselAttrOrder = [
                {
                    id: 'name',
                    type: 'string'
                },
                {
                    id: 'exMark',
                    type: 'string'
                },
                {
                    id: 'country',
                    type: 'string'
                }
            ];

            var vessel = angular.copy(data);
            delete vessel.contactParties;
            
            vessel.vesselOverview = {};

            var attrOrder = angular.copy(vesselAttrOrder);
            var vesselIdx = attrOrder.length;

            angular.forEach(vessel,function(prop,propName){
                if(!_.isObject(prop)){
                    vessel.vesselOverview[propName] = prop;
                    delete vessel[propName];
                }
            });

            if(angular.isDefined(vessel.vesselIds) && vessel.vesselIds.length){
                _.extend(vessel.vesselOverview,addExtraDetails(vessel.vesselIds,attrOrder,vesselIdx));
            }

            self.tripVessel = {};
            self.tripVessel.vesselOverview = vessel.vesselOverview;

            self.tripVessel.vesselOverview = fishingActivityService.loadFaDetails(self.tripVessel.vesselOverview, attrOrder);


            angular.forEach(data.contactParties,function(value, key) {
                value.type = value.role + ' - ' + value.contactPerson.alias;
            });
            self.tripRoles = data.contactParties;

        }
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
     * generates colors for species
     * 
     * @memberof Trip
     * @private
     * @param {Object} catchData - catch details data
     */
    var generateSpecieColors = function(catchData) {
        var specieColors = [];
        var specieList = _.unique(_.pluck(_.flatten(_.pluck(catchData, 'speciesList')), 'speciesCode'));

        if (angular.isDefined(specieList) && specieList.length > 0) {
            var colors = palette('tol-rainbow', specieList.length);
            angular.forEach(specieList, function(value, key) {
                if (angular.isDefined(value)) {
                    specieColors.push({
                        code: value,
                        color: colors[key]
                    });
                }
            });           
            return specieColors;
        }
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
        
       self.specieColor = generateSpecieColors(data);
        //if has speciesList in the child properties
        if(_.without(_.pluck(data, 'speciesList'),undefined).length > 0){
            angular.forEach(data, function(type,typeName){
                type.title = locale.getString('activity.catch_panel_title_' + typeName);
                type.caption = locale.getString('activity.catch_panel_caption_' + typeName) + ' ' + type.total + ' kg';

                if (angular.isDefined(type.speciesList) && type.speciesList.length > 0){

                    angular.forEach(type.speciesList, function(value, key) {
                        var specieColor = _.where(self.specieColor, {code: value.speciesCode})[0].color;
                        type.speciesList[key].color = '#' + specieColor;
                        type.speciesList[key].tableColor = {'background-color': tinycolor('#' + specieColor).setAlpha(0.7).toRgbString()};
                    });
                }
            });
            self.catchDetails = data;
        }else{
            self.catchDetails = undefined;
        }
    };

    return Trip;
});

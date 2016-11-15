/**
 * @memberof unionvmsWeb
 * @ngdoc model
 * @name Departure
 * @attr {String} faType - The fishing activity type (always departure)
 * @attr {String | Null} operationType - The fishing activity operation type (e.g. Correction)
 * @attr {Object} summary - An object containing the fishing activity summary data (like occurence, reason, ...)
 * @attr {Object} port - An object containing all the data of the port of departure
 * @attr {Array} gears - An array conatining objects that describe the available gears
 * @attr {Object} reportDoc - An object containing all the data related with the fishing activity report document
 * @attr {Object} fishingData - An object containing all the data related with fishing data (like fish species and weights retained on board, locations 
 * @description
 *  A model to store all the data related to a departure in a standardized way
 */
angular.module('unionvmsWeb').factory('Departure',function() {
    
    function Departure(){
        this.faType = 'fa_type_departure';
        this.operationType = undefined;
        this.summary = {
            occurence: undefined,
            reason: undefined,
            fisheryType: undefined,
            targetedSpecies: []
        };
        this.port = {
            name: undefined,
            coordinates: []
        };
        this.gears = [];
        this.reportDoc = {
            type: undefined,
            id: undefined,
            refId: undefined,
            creationDate: undefined,
            purposeCode: undefined,
            purpose: undefined
        };
        this.fishingData = {}; //TODO explicit fishing data for reference mainly
    }
    
    /**
     * Load the model with data
     * 
     * @memberof Departure
     * @public
     * @param {Object} data - The source data to fill in the model
     */
    Departure.prototype.fromJson = function(data){
        //FIXME when backend service ready
        this.operationType = 'correction';
        this.summary = {
            occurence: '2014-05-27T07:47:31',
            reason: 'Fishing',
            fisheryType: 'Demersal',
            targetedSpecies: ['COD', 'SOL', 'COD', 'SOL', 'COD']
        };
        this.port = {
            name: 'BEZEE -  Zeebrugge',
            geometry: 'POINT(5.5 60.5)'
        };
        this.gears = [{
            type: 'TBB',
            role: 'On board',
            meshSize: '80mm',
            beamLength: '6m',
            numBeams: 4
        }];
        this.reportDoc = {
            type: 'Declaration',
            id: 'b2c32a5d-417c-a44a-00c827b4be32',
            refId: 'b999ef58-4343-946c-31219e75e39d',
            creationDate: '2014-05-27T07:47:31',
            purposeCode: 5,
            purpose: 'Altered departure port'
        };
        this.fishingData = {};
    };
    
    return Departure;
});
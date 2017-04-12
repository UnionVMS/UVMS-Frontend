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
 * @ngdoc service
 * @name mdrCacheService
 * @param $q {Service} the angular $q service
 * @param mdrRestService {Service} MDR Rest Service <p>{@link unionvmsWeb.mdrRestService}</p>
 * @description
 *  A service to request code lists from MDR and keep a local cache in the application. It should only be used with
 *  small code lists that are used many times in the application.
 */
angular.module('unionvmsWeb').factory('mdrCacheService',function($q, mdrRestService) {
	var mdrServ = {
	    codeLists: {}
	};
	
	/**
	 * Get code list for requested type. This function will check if the code list is already cached and, if not, it will
	 * request the list from the server and cache it
	 * 
	 * @memberof mdrCacheService
	 * @public
	 * @alias getCodeList
	 * @param {String} listName - The mdr code list name (should be the same name as the path parameter for the REST service)
	 * @returns {Promise} Promise with the code list data or an error
	 */
	mdrServ.getCodeList = function(listName){
	    var deferred = $q.defer();
	    
	    if (_.has(this.codeLists, listName)){
	        deferred.resolve(this.codeLists[listName]);
	    } else {
	        getCodeListFromServer(listName, deferred);
	    }
	    
	    return deferred.promise;
	};
	
	
	/**
	 * Get a description by code of a specified MDR list. It assumes that the list is already loaded in the cache.
	 * 
	 * @memberof mdrCacheService
	 * @public
	 * @alias getDescriptionByCode
	 * @param {String} listName - The mdr code list name (should be the same name as the path parameter for the REST service)
	 * @param {String} code - The code to which the description will be fetched
	 * @returns {String|Undefined} The description corresponding to the specified code and list or undefined
	 */
	mdrServ.getDescriptionByCode = function(listName, code){
	    if(_.has(this.codeLists, listName)){
	        var item = _.findWhere(this.codeLists[listName], {code: code});
	        if (angular.isDefined(item)){
	            return item.description;
	        }
	    }
	};
	
	/**
	 * Get the code list from server
	 * 
	 * @memberof mdrCacheService
	 * @private
	 * @param {String} listName - The mdr code list name
	 * @param {Object} deferred - The deferred object
	 */
	function getCodeListFromServer (listName, deferred){
	    mdrRestService.getCodeList(listName).then(function(response){
	        mdrServ.codeLists[listName] = response;
	        deferred.resolve(mdrServ.codeLists[listName]);
	    }, function(error){
	        deferred.reject(error);
	    });
	}

	return mdrServ;
});
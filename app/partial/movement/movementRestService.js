angular.module('unionvmsWeb')
.factory('movementRestFactory', function($resource, $q, restConstants){
	var baseUrl = restConstants.baseUrl;

	return {
		getMovementList : function(){
			return $resource(baseUrl + '/movement/rest/movement/list',{},
			{ 
				list : { method : 'POST'}
			});
		}
	};
})
.factory('movementRestService',function($q, movementRestFactory, MovementListPage, Movement){
	var baseUrl, userName;
	//baseUrl = restConstants.baseUrl;
	userName = "FRONTEND_USER";

	var getMovementList = function(getListRequest){

		var deferred = $q.defer();
		movementRestFactory.getMovementList().list(getListRequest.DTOForMovement(), function(response){
				if(response.code !== "200"){
					deferred.reject("Invalid response status");
					return;
				}
				var movements = [];
				var currentPage, totalNumberOfPages;

				if(angular.isArray(response.data)){
					for (var i = 0; i < response.data.length; i++){
						movements.push(Movement.fromJson(response.data[i]));
					}
				}
				if(!response.data.currentPage){
						currentPage = 1;
					} else {
						currentPage = response.data.currentPage;	
					}
				if(!response.data.totalNumberOfPages){
					totalNumberOfPages = 1;
				} else {
					totalNumberOfPages = response.data.totalNumberOfPages;
				}

				var movementListPage = new MovementListPage(movements, currentPage, totalNumberOfPages);

				deferred.resolve(movementListPage);
			},
			function(error){
				//Mock answer until webservice is up and running....
				console.log("Error getting movements.");
				console.log(error);
				deferred.reject(error);

				//MOCKING!!!
				/*console.info("MOCKING IN PROGRESS!!!!!");
				console.log("Mocking answer until webservice is up and running....");

				var mockdatas = [];

				for (var i = 0; i < 16; i++){
					var mockdata = {};
					mockdata.state = "SWE";
					mockdata.externalMarking = "FRE 002";
					mockdata.ircs = 123 + i;
					mockdata.name = "FREJA " + i;
					mockdata.time = "2015-05-06 18:30";
					mockdata.latitude = 45 + i +" deg; 33,43\' N";
					mockdata.longitude = 32 + i * 2 + " deg; 41,43\' E";
					mockdata.status = "010";
					mockdata.measuredSpeed = "8.05 kts";
					mockdata.calculatedSpeed = "9 kts";
					mockdata.course = 116 + i;
					mockdata.messageType = "Automatic";
					mockdata.source = "Inmarsat C";
					mockdatas.push(mockdata);
				}

				var movements = [];
				var currentPage, totalNumberOfPages;
				currentPage = 1;
				totalNumberOfPages = 1;
				
				var movementListPage = new MovementListPage(mockdatas, currentPage, totalNumberOfPages);
				deferred.resolve(movementListPage);
				*/
			}
	);
		return deferred.promise;
	
	};

	return {
		getMovementList : getMovementList
	};

});
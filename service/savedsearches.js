(function(){

    var savedsearches = function(){

        var getSavedSearches = function(){
            return[
                {
                    'name':'Groups',
                            'members':[
                                {
                                    'name':'Swedish shrimp fishing vessel',
                                    'value':'Swedish'
                                },
                                {
                                    'name':'EU Fishing vessels',
                                    'value':'EU'
                                },
                                {
                                    'name':'Swedish vessels',
                                    'value':'SWV'
                                }
                            ]
                },
                {
                    'name':'Saved searches',
                            'members':[
                                {
                                    'name':'Inactive for over a year',
                                    'value':'Inactive'
                                },
                                {
                                    'name':'EU vessels',
                                    'value':'EUV'
                                }
                            ]
                }
            ];
        };

        var getGroups = function(){
            return[
                {
                    'id':'12',
                    'name':'Swedish sharks',
                    'filter': 'Dock'
                },
                {
                    'id':'13',
                    'name':'Danish shrimps',
                    'filter': 'Anchor'
                },
                {
                    'id':'14',
                    'name':'UK lobsters',
                    'filter': 'Fishing'
                }

            ];
        };

        var getPredefinedGroups = function(){
            return[
                {
                    'id':'21',
                    'name':'Swedish vessels',
                    'filter': 'SWE'
                },
                {
                    'id':'22',
                    'name':'Danish trawlers',
                    'filter': 'DK'
                },
                {
                    'id':'23',
                    'name':'EU vessels',
                    'filter': 'ROU'
                }];
        };

        return{
            getSavedSearches : getSavedSearches,
            getGroups : getGroups,
            getPredefinedGroups : getPredefinedGroups
        };
    };

    var module = angular.module('unionvmsWeb');
    module.factory('savedsearches',savedsearches);

}());

/*
angular.module('unionvmsWeb').factory('savedsearches',function() {

	var savedsearches = {};

	return savedsearches;
});
*/

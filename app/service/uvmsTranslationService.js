(function(){

    var uvmsTranslationService = function($resource){

        var getTranslation = function ($scope) {
            //var languageFilePath = 'languagefiles/uvmsTranslation_' + language + '.json';
            var languageFilePath = 'assets/languagefiles/uvmsTranslation_sv.json';
            console.log(languageFilePath);

            $resource(languageFilePath).get(function (data) {
                $scope.translation = data;
            });
        };

        var getWord = function(wordToTranslate){

        };

        return {
            getword: getWord,
            getTranslation : getTranslation
        };
    };

    var module = angular.module('unionvmsWeb');
    module.factory('uvmsTranslationService',uvmsTranslationService);

}());

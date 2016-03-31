angular.module('unionvmsWeb').directive('currentTime', function(dateTimeService, $timeout) {
	return {
		restrict: 'E',
		link: function(scope, element, attrs, fn) {
            //Update time string
            function updateText(){
                //Create new UTC date and format the output.
                var time = dateTimeService.format(moment.utc());
                element.text(time + " (UTC)");
            }

            //Update every second
            function updateTime() {
                $timeout(function() {
                  updateText();
                  updateTime();
                }, 1000);
            }

            updateTime();
		}
	};
});
angular.module('unionvmsWeb')
    .factory('PollListPage', function() {

        function PollListPage(polls, currentPage, totalNumberOfPages){
            this.polls = _.isArray(polls) ? polls : [];
            this.currentPage = _.isNumber(currentPage) ? currentPage : 0;
            this.totalNumberOfPages = _.isNumber(totalNumberOfPages) ? totalNumberOfPages : 0;
        }

        return PollListPage;
    });


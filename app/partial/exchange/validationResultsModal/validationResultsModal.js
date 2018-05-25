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
angular.module('unionvmsWeb').controller('ValidationresultsmodalCtrl',function($scope, $modalInstance, $compile, $log, locale, exchangeRestService, msgGuid){
    $scope.isTableVisible = true;
    $scope.validationResults = [];
    $scope.isLoading = true;
    $scope.inValidXpath = false;
    
    var init = function(){
        exchangeRestService.getValidationResults(msgGuid).then(function(response){
            $scope.validationResults = response.validationList;
            $scope.displayedResults = [].concat(response.validationList);
            $scope.msg = vkbeautify.xml(response.msg);
            $scope.isLoading = false;
        }, function(error){
            $log.error("Error getting validation results.");
            $scope.isLoading = false;
            $scope.errorMessage = locale.getString('exchange.get_validation_results_error');
        });
    };
    
    var getSelectorPath = function(xpath){
        var regex = /(?:\[local\-name\(\)\=['"]([A-z1-9\-]+)['"]\](?:\)\[([1-9])+\])?)+/g;
        var xpathArr = xpath.split('\/\/\*');

        var selectorPath = [];
        angular.forEach(xpathArr, function(xpath){
            var patt = new RegExp(regex);
            var res = patt.exec(xpath);

            if(!_.isNull(res)){
                if(!angular.isDefined(res[2])){
                    res[2] = 1;
                }

                selectorPath.push({
                    varName: res[1],
                    idx: res[2]-1
                });
            }
        });

        return selectorPath;
    };

    var convertTextToSpan = function(nextElement){
        if(nextElement[0].nodeType === Node.TEXT_NODE){
            var textSpan = $('<span>' + nextElement[0].nodeValue + '</span>').insertBefore(nextElement[0].nextSibling);
            $(nextElement).detach();

            return textSpan;
        }
    };

    var getValidXPath = function(selectorPath){
        if(selectorPath && selectorPath.length){
            var doc = new DOMParser().parseFromString($scope.msg,'text/xml');

            for(var i=selectorPath.length-1;i>=0;i--){

                var xpath = '';
                for(var j=0;j<selectorPath.length;j++){
                    if(j>i){
                        break;
                    }else{
                        xpath += selectorPath[j];
                        if(j<i){
                            xpath += '\/\/\*';
                        }
                    }
                }

                try {
                    var result = doc.evaluate(xpath, doc, null, XPathResult.STRING_TYPE, null);

                    if(result.stringValue){
                        return xpath;
                    }
                } catch (e) {
                    return undefined;
                }

            }
            
        }

        return undefined;
    };

    var highligthCode = function(xpath){
        $scope.inValidXpath = false;
        var xpathArr = xpath.split('\/\/\*');
        var selectorPath = getValidXPath(xpathArr);

        if(selectorPath){
            var selectorPathArr = getSelectorPath(selectorPath);
            var parentNode;
            var selector = '.validationResultsModal .xml-content .hljs-tag:contains("' + selectorPathArr[0].varName + '")';
            var curElement = angular.element(angular.element(selector)[selectorPathArr[0].idx]);
            var nextElement;
            var closeRegex;
            var closeRegex2;
            var convertedText;

            if(selectorPathArr.length>1){
                nextElement = curElement.next();
                for(var i=1;i<selectorPathArr.length;i++){
                    var countIdx = 0;
                    while(nextElement && nextElement.length > 0){
                        console.log('countIdx: ' + countIdx);
                        var openElement = angular.element(nextElement).find('span:contains("' + selectorPathArr[i].varName + '")');
                        closeRegex = new RegExp("&lt;\/<span class\=\"hljs-name\"\>[a-z]*:" + selectorPathArr[i].varName + "<\/span>&gt;");
                        closeRegex2 = new RegExp("&lt;\/<span class\=\"hljs-name\"\>" + selectorPathArr[i].varName + "<\/span>&gt;");
                        if(openElement.length && countIdx === selectorPathArr[i].idx && openElement[0].parentElement.innerHTML.search(closeRegex) === -1){
                            if(i === selectorPathArr.length - 1){
                                convertedText = convertTextToSpan(nextElement);
                                if(convertedText){
                                    nextElement = convertedText;
                                }

                                console.log('highlight');
                                angular.element(nextElement).addClass('xml-highlight');

                                nextElement = angular.element(nextElement[0].nextSibling);
                                while(nextElement && nextElement.length > 0){
                                    convertedText = convertTextToSpan(nextElement);
                                    if(convertedText){
                                        nextElement = convertedText;
                                    }

                                    angular.element(nextElement).addClass('xml-highlight');

                                    if (nextElement.length && nextElement[0].innerHTML.search(closeRegex2) !== -1){
                                        break;
                                    } else if(nextElement.length && nextElement[0].innerHTML.search(closeRegex) === -1){
                                        nextElement =  angular.element(nextElement[0].nextSibling);
                                    }else{
                                        break;
                                    }
                                }
                                break;
                            }else{
                                nextElement = nextElement.next();
                                break;
                            }
                        }else{
                            if (openElement.length && openElement[0].parentElement.innerHTML.search(closeRegex) === -1){
                                countIdx += 1;
                            }
                            nextElement = nextElement.next();
                        }
                    }
                }
            }else{
                curElement.addClass('xml-highlight');
                nextElement = curElement.next();
                closeRegex = new RegExp("&lt;\/<span class\=\"hljs-name\"\>[a-z]*:" + selectorPathArr[0].varName + "<\/span>&gt;");
                while(nextElement && nextElement.length > 0){

                    convertedText = convertTextToSpan(nextElement);
                    if(convertedText){
                        nextElement = convertedText;
                    }

                    angular.element(nextElement).addClass('xml-highlight');

                    if(nextElement[0].innerHTML.search(closeRegex) === -1){
                        nextElement =  angular.element(nextElement[0].nextSibling);
                    }else{
                        break;
                    }

                    nextElement = angular.element(nextElement[0].nextSibling);
                }
            }
        } else {
            $scope.inValidXpath = true;
            $scope.errorMessage = locale.getString('exchange.invalid_xpath');
        }
    };

    var processXpaths = function(xpaths){
        var xpathSrcs = xpaths.split(',');
        angular.forEach(xpathSrcs, function(xpath){
            highligthCode(xpath);
        });
    };

    $scope.showError = function(xpath){
        if (xpath !== ''){
            processXpaths(xpath);
            $scope.togglePanelVisibility();
        }
    };
    
    $scope.togglePanelVisibility = function(xpath){
        //Clear existing highlights
        if (!$scope.isTableVisible){
            angular.element('.xml-highlight').removeClass('xml-highlight');
        }
        $scope.isTableVisible = !$scope.isTableVisible;
    };
    
    //Close modal
    $scope.cancel = function () {
        if (!$scope.isTableVisible){
            $scope.togglePanelVisibility();
        } else {
            $modalInstance.dismiss('cancel');
        }
    };
    
    init();
});

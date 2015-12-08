angular.module('unionvmsWeb').controller('SegmentstylesCtrl',function($scope){
	$scope.segmentProperties = [];
	$scope.segmentProperties.push({"text": "Measured speed", "code": "speedOverGround"});
	
	$scope.segmentProperty = null;
	$scope.isAddNewRuleActive = true;
	$scope.defaultColor = undefined;
	
	$scope.rulesList = [];
	
	$scope.addNewRule = function(){
		if($scope.isAddNewRuleActive){
			var nextFrom;
			if($scope.rulesList && $scope.rulesList.length > 0){
				nextFrom = _.last($scope.rulesList).propertyTo;
			}
			$scope.rulesList.push({"propertyFrom": nextFrom, "propertyTo": undefined, "color": undefined});
			$scope.isAddNewRuleActive = false;
		}
	};
	
	$scope.removeRuleByIndex = function(index, nrErrors){
		$scope.rulesList.splice(index, 1);
		
		if($scope.rulesList.length > index + 1){
			if(index > 0){
				$scope.rulesList[index].propertyFrom = $scope.rulesList[index-1].propertyTo;
			}
			if($scope.rulesList[index].propertyFrom >= $scope.rulesList[index].propertyTo){
				$scope.rulesList[index].propertyTo = undefined;
			}
			$scope.updateNextRule($scope.rulesList[index]);
		}
		$scope.isAddNewRuleActive = _.allKeys($scope.segmentsForm.$error).length === nrErrors || (_.allKeys($scope.segmentsForm.$error).length === 1 + nrErrors && $scope.segmentsForm.$error.segDefColor);
	};
	
	$scope.changeProperty = function(){
		if($scope.segmentProperty){
			$scope.rulesList = $scope[$scope.segmentProperty] || [];
		}else{
			$scope.rulesList = [];
		}
	};
	
	$scope.updateNextRule = function(item){
		if(item === _.last($scope.rulesList)){
			return;
		}
		var index = $scope.rulesList.indexOf(item) + 1;
		$scope.rulesList[index].propertyFrom = $scope.rulesList[index-1].propertyTo;
		if($scope.rulesList[index].propertyFrom >= $scope.rulesList[index].propertyTo){
			$scope.rulesList[index].propertyTo = undefined;
			if(index + 1 < $scope.rulesList.length) {
				$scope.rulesList[index+1].propertyFrom = undefined;
			}
		}
	};
	
	$scope.validateDefaultColor = function(){
		if($scope.defaultColor && ($scope.defaultColor.length <= 3 || $scope.defaultColor.indexOf('#') === -1)){
			$scope.segmentDefaultForm.$setValidity('segDefColor', false);
			return;
		}
		$scope.segmentDefaultForm.$setValidity('segDefColor', true);
	};
	
	$scope.loadSegmentProperties = function(){
		var segmentProperties = $scope.adminConfig.data.stylesSettings.segments;
		$scope.segmentProperty = segmentProperties.attribute;
		
			if(segmentProperties.attribute === "speedOverGround"){
				var speedOverList = [];
				angular.forEach(segmentProperties.style, function(value,key){
					if(key === "default"){
						$scope.defaultColor = value;
					}else{
						var rangeData = key.split("-");
						speedOverList.push({"propertyFrom": parseInt(rangeData[0]), "propertyTo": rangeData[1] ? parseInt(rangeData[1]) : undefined, "color": value});
					}
				});
				speedOverList = _.sortBy(speedOverList, 'propertyFrom');
				$scope[segmentProperties.attribute] = speedOverList;
			}
	};
	
	$scope.saveSegmentStyles = function(){
		if(!_.isEmpty($scope.segmentsForm.$error) || !$scope.segmentProperty){
			return;
		}

		$scope.adminConfig.data.stylesSettings.segments = $scope.segmentProperty;
		var segmentProperties = [];
		
		if(segmentProperties.attribute === "speedOverGround"){
			angular.forEach($scope.rulesList, function(item){
				var obj = {};
				obj[item.propertyFrom + "-" + item.propertyTo] = item.color;
				segmentProperties.push(obj);
			});
			segmentProperties.push({"default": $scope.defaultColor});
		}
		$scope.adminConfig.data.stylesSettings.segments = segmentProperties;
	};
	
	$scope.$watch('segmentProperty', $scope.changeProperty);
	
	$scope.$on('updateAddNewRuleActive', function(event) { $scope.isAddNewRuleActive = _.isEmpty($scope.segmentsForm.$error) || (_.allKeys($scope.segmentsForm.$error).length === 1 && $scope.segmentsForm.$error.segDefColor) ? true : false; });
	$scope.$on('updateNextRule', function(event, item) { $scope.updateNextRule(item); });
	$scope.$on('removeRule', function(event, index, nrErrors) { $scope.removeRuleByIndex(index, nrErrors); });
	
	$scope.adminConfig = {
            "data": {
                "toolSettings": {
                                "control": [{
                                                "type": "zoom"
                                }, {
                                                "type": "drag"
                                }, {
                                                "type": "scale"
                                }, {
                                                "type": "mousecoords"
                                }, {
                                                "type": "history"
                                }],
                                "tbControl": [{
                                                "type": "measure"
                                }, {
                                                "type": "fullscreen"
                                }, {
                                                "type": "print"
                                }]
                },
                "stylesSettings": {
                                "positions": {
                                                "attribute": "countryCode",
                                                "style": {
                                                                "BLZ": "#BA9566",
                                                                "HMD": "#90B7EA",
                                                                "BGD": "#A2FCA1",
                                                                "SGS": "#25480E",
                                                                "ATF": "#F8586D",
                                                                "OMN": "#A5BC0F",
                                                                "ITA": "#2448BE",
                                                                "TZA": "#9F9C60",
                                                                "PAN": "#EDB0A4",
                                                                "HUN": "#90EE5E",
                                                                "PRT": "#88A67E",
                                                                "COL": "#BAA4B9",
                                                                "VAT": "#34318D",
                                                                "GRL": "#431FBA",
                                                                "BEN": "#3B2D55",
                                                                "PRY": "#DC925A",
                                                                "VEN": "#62A00D",
                                                                "TJK": "#33BAC1",
                                                                "IRQ": "#7F7229",
                                                                "CIV": "#4CF191",
                                                                "MDA": "#4FB100",
                                                                "MNG": "#00185A",
                                                                "KAB": "#678CBC",
                                                                "ALD": "#56D559",
                                                                "CHE": "#4831C5",
                                                                "MKD": "#90284E",
                                                                "AFG": "#546008",
                                                                "MDG": "#AF6080",
                                                                "CYM": "#75F2C7",
                                                                "UKR": "#B29152",
                                                                "EST": "#4570B6",
                                                                "GRC": "#43B5CC",
                                                                "BRA": "#ECFC48",
                                                                "YEM": "#977E67",
                                                                "BLR": "#A29B1A",
                                                                "PRI": "#20E7B3",
                                                                "BTN": "#60BCF0",
                                                                "MHL": "#168DAF",
                                                                "CHN": "#53F8F2",
                                                                "MUS": "#AD5277",
                                                                "TGO": "#5A0404",
                                                                "TLS": "#414A80",
                                                                "CMR": "#3C2101",
                                                                "IDN": "#A65AD4",
                                                                "CRI": "#2E1240",
                                                                "ZWE": "#EE1555",
                                                                "EGY": "#027159",
                                                                "GRD": "#3C442B",
                                                                "POL": "#396388",
                                                                "IOT": "#610F3A",
                                                                "MLI": "#05E733",
                                                                "LTU": "#D8C8F2",
                                                                "MYS": "#A2B6E8",
                                                                "AIA": "#C9FD46",
                                                                "MEX": "#7A7A79",
                                                                "SHN": "#767F27",
                                                                "ROU": "#9BF84D",
                                                                "FJI": "#6302B5",
                                                                "PER": "#84A4F2",
                                                                "AUS": "#8BF15D",
                                                                "IOA": "#C98C7C",
                                                                "TON": "#3B6B1D",
                                                                "NIC": "#EE9D47",
                                                                "AGO": "#F50C17",
                                                                "GEO": "#6AD371",
                                                                "MWI": "#2199BF",
                                                                "CYN": "#E24581",
                                                                "QAT": "#9DAC60",
                                                                "RUS": "#1CA128",
                                                                "SDS": "#025A43",
                                                                "THA": "#BA1FCD",
                                                                "MMR": "#60C706",
                                                                "FRO": "#738D0B",
                                                                "TTO": "#3482BB",
                                                                "NOR": "#67B250",
                                                                "ESB": "#949FC2",
                                                                "ESP": "#9D00FA",
                                                                "BMU": "#DFA72B",
                                                                "ERI": "#F534BA",
                                                                "IRL": "#AA7500",
                                                                "MNE": "#114AE1",
                                                                "CSI": "#E2D9F0",
                                                                "TUR": "#E075D8",
                                                                "FIN": "#950B96",
                                                                "HND": "#936D67",
                                                                "MCO": "#443A6A",
                                                                "UMI": "#C1F3F7",
                                                                "RWA": "#46C491",
                                                                "UZB": "#15E04F",
                                                                "NER": "#8F7AD2",
                                                                "KAZ": "#EB69AA",
                                                                "JEY": "#D8CBB1",
                                                                "NAM": "#0B3C1F",
                                                                "JPN": "#6E5D09",
                                                                "PGA": "#88BA97",
                                                                "GUY": "#CEE7A8",
                                                                "BIH": "#A210CC",
                                                                "SYR": "#338EC3",
                                                                "GGY": "#7C8293",
                                                                "JAM": "#2F8757",
                                                                "FRA": "#378B91",
                                                                "ASM": "#5A3FA1",
                                                                "LCA": "#4EE4F7",
                                                                "NIU": "#D19DB4",
                                                                "AND": "#BF7ABB",
                                                                "FLK": "#F51CE7",
                                                                "SMR": "#3EE589",
                                                                "DJI": "#9BC5C1",
                                                                "NFK": "#E5E46A",
                                                                "BOL": "#05ACB7",
                                                                "URY": "#AA27D7",
                                                                "AZE": "#C2F5FF",
                                                                "MAF": "#E78929",
                                                                "SOM": "#0DA278",
                                                                "TUV": "#6A6DFC",
                                                                "ZAF": "#78D3F0",
                                                                "SVK": "#23B8E2",
                                                                "PSX": "#C3E16F",
                                                                "SPM": "#D2C39B",
                                                                "NRU": "#4685D4",
                                                                "PRK": "#769499",
                                                                "KGZ": "#757056",
                                                                "IRN": "#AC256C",
                                                                "LAO": "#BBBFF5",
                                                                "VUT": "#0DFCE2",
                                                                "KAS": "#37C92D",
                                                                "KHM": "#A5EEAD",
                                                                "SVN": "#FD1D5E",
                                                                "PLW": "#CEF287",
                                                                "BDI": "#21C8C7",
                                                                "MSR": "#1793A9",
                                                                "DMA": "#24DC5B",
                                                                "KWT": "#0E6C8B",
                                                                "TCA": "#4F2668",
                                                                "UGA": "#8AE74E",
                                                                "VNM": "#A8DA19",
                                                                "DEU": "#4FA409",
                                                                "MOZ": "#1A6AF4",
                                                                "CPV": "#3EAA1D",
                                                                "SER": "#3BB1BF",
                                                                "ECU": "#D03B4A",
                                                                "GTM": "#D0D7DB",
                                                                "ZMB": "#00B011",
                                                                "SGP": "#69D1DD",
                                                                "NPL": "#488A9C",
                                                                "KEN": "#A2EB89",
                                                                "LIE": "#A76080",
                                                                "TWN": "#A0C7F0",
                                                                "CAN": "#751615",
                                                                "GNB": "#EA79D7",
                                                                "BGR": "#B481CA",
                                                                "DOM": "#354F65",
                                                                "LKA": "#478920",
                                                                "LSO": "#4FD08A",
                                                                "AUT": "#A140CD",
                                                                "TUN": "#A0A9FA",
                                                                "BHS": "#7541B7",
                                                                "ATC": "#74B3B7",
                                                                "CLP": "#8C033F",
                                                                "JOR": "#4A852E",
                                                                "CYP": "#4CEDCC",
                                                                "GHA": "#13BB7C",
                                                                "USG": "#70B6DB",
                                                                "IMN": "#497B3D",
                                                                "SRB": "#D3399A",
                                                                "DZA": "#F064B9",
                                                                "GIB": "#C7228D",
                                                                "LVA": "#FF3F1D",
                                                                "ATA": "#C9B2F0",
                                                                "WSM": "#95524A",
                                                                "ARM": "#4E7FD8",
                                                                "SAU": "#EF5956",
                                                                "ALB": "#E026E5",
                                                                "KOS": "#CD2AD8",
                                                                "NCL": "#4AB9F3",
                                                                "WSB": "#46198C",
                                                                "BHR": "#0FBD83",
                                                                "SLV": "#C82EFB",
                                                                "VIR": "#E8F5C5",
                                                                "HRV": "#0CEF9B",
                                                                "IND": "#540038",
                                                                "COM": "#5B6232",
                                                                "HKG": "#E794BC",
                                                                "TCD": "#B976F6",
                                                                "SOL": "#89AE6C",
                                                                "LBY": "#347B64",
                                                                "USA": "#E715AE",
                                                                "PYF": "#CB9419",
                                                                "DNK": "#A3EF1D",
                                                                "FSM": "#60984C",
                                                                "SAH": "#A05E32",
                                                                "ISL": "#49A647",
                                                                "MRT": "#575573",
                                                                "CHL": "#294970",
                                                                "SUR": "#D9AFFA",
                                                                "SYC": "#29D6F9",
                                                                "GIN": "#7A7F93",
                                                                "GBR": "#5DBEFF",
                                                                "LUX": "#502B2B",
                                                                "BJN": "#AC8428",
                                                                "NLD": "#8E9C89",
                                                                "SCR": "#BF0735",
                                                                "PHL": "#B48E60",
                                                                "COD": "#266784",
                                                                "SLE": "#99CD13",
                                                                "WLF": "#2F8AC8",
                                                                "SEN": "#8D25B8",
                                                                "BFA": "#6B2142",
                                                                "SXM": "#83A5FE",
                                                                "ATG": "#79A01B",
                                                                "ETH": "#5D0229",
                                                                "MNP": "#8F3DBC",
                                                                "ABW": "#5D6EAF",
                                                                "CUW": "#AEF44A",
                                                                "GAB": "#C1A6E4",
                                                                "TKM": "#BA183F",
                                                                "BRN": "#E31B47",
                                                                "MLT": "#DB0C73",
                                                                "CNM": "#67DC5D",
                                                                "CUB": "#291584",
                                                                "PAK": "#819D6E",
                                                                "KIR": "#F88F8D",
                                                                "BEL": "#673B10",
                                                                "BLM": "#E10595",
                                                                "BWA": "#588FA9",
                                                                "MAC": "#CC005A",
                                                                "GUM": "#B0F925",
                                                                "ARG": "#F7C4D9",
                                                                "VCT": "#446686",
                                                                "CAF": "#D37D3E",
                                                                "MAR": "#8C306D",
                                                                "NZL": "#BD544C",
                                                                "LBN": "#5A10E7",
                                                                "CZE": "#DC111D",
                                                                "KNA": "#220801",
                                                                "GNQ": "#CD5808",
                                                                "KOR": "#B0FF8F",
                                                                "VGB": "#271627",
                                                                "GMB": "#B49FD6",
                                                                "PCN": "#48CAD4",
                                                                "STP": "#B22D92",
                                                                "NGA": "#2EA46A",
                                                                "COG": "#2A6794",
                                                                "HTI": "#E6EDD1",
                                                                "LBR": "#61E1A6",
                                                                "ISR": "#148F0D",
                                                                "SWZ": "#4837C4",
                                                                "PNG": "#F676F4",
                                                                "MDV": "#C15996",
                                                                "SLB": "#987854",
                                                                "BRB": "#5E9B29",
                                                                "SDN": "#2269AC",
                                                                "ARE": "#A7460C",
                                                                "COK": "#0AF1CB",
                                                                "SWE": "#EFF72A"
                                                }
                                },
                                "segments": {
                                                "attribute": "speedOverGround",
                                                "style": {
                                                                "0-2": "#1a9641",
                                                                "2-5": "#a6d96a",
                                                                "5-8": "#fdae61",
                                                                "default": "#d7191c"
                                                }
                                }
                },
                "systemSettings": {
                                "geoserverUrl": "http://localhost:8080/geoserver/"
                },
                "layerSettings": {
                                "overlayLayers": [{
                                                "type": "WMS",
                                                "serviceLayerId": "4"
                                }, {
                                                "type": "WMS",
                                                "serviceLayerId": "1"
                                }, {
                                                "type": "WMS",
                                                "serviceLayerId": "2"
                                }, {
                                                "type": "OSEA",
                                                "serviceLayerId": "7"
                                }],
                                "baseLayers": [{
                                                "type": "OSM",
                                                "serviceLayerId": "6"
                                }, {
                                                "type": "WMS",
                                                "serviceLayerId": "3"
                                }]
                },
                "mapSettings": {
                                "refreshStatus": true,
                                "scaleBarUnits": "nautical",
                                "coordinatesFormat": "dd",
                                "mapProjectionId": 1,
                                "refreshRate": 100,
                                "displayProjectionId": 2
                },
                "visibilitySettings": {
                                "positions": {
                                                "popup": ["fs", "extMark", "ircs", "cfr", "posTime", "crs", "c_spd", "m_spd", "stat", "lat", "lon", "msg_tp", "act_tp", "source"],
                                                "labels": ["fs", "extMark", "ircs", "cfr", "posTime", "lon", "lat", "stat", "m_spd", "c_spd", "crs", "msg_tp", "act_tp", "source"]
                                },
                                "segments": {
                                                "popup": ["fs", "extMark", "ircs", "cfr", "dist", "dur", "spd", "crs", "cat"],
                                                "labels": ["extMark", "ircs", "cfr", "dist", "cat", "crs", "spd", "dur", "fs"]
                                }
                }
	},
	"code": 200
	};

	$scope.loadSegmentProperties();
});
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
describe('ActivityfiltersfieldsetCtrl', function () {

	beforeEach(module('unionvmsWeb'));
	
    beforeEach(module(function($provide) {
        $provide.service('componentUtilsService', function() {
            return {
                convertCodelistToCombolist: function() {
                    return {};
                }
            }
        })
    }));

	var scope, ctrl, mdrCacheServiceSpy, $httpBackend;

	beforeEach(function () {
		mdrCacheServiceSpy = jasmine.createSpyObj('mdrCacheService', ['getCodeList']);
		module(function ($provide) {
			$provide.value('mdrCacheService', mdrCacheServiceSpy);
		});
		buildMocks();
	});

	beforeEach(inject(function ($rootScope, $controller, $injector) {
		$httpBackend = $injector.get('$httpBackend');
		$httpBackend.whenGET(/usm/).respond();
		$httpBackend.whenGET(/i18n/).respond();
		$httpBackend.whenGET(/globals/).respond({ data: [] });

		scope = $rootScope.$new();
		ctrl = $controller('ActivityfiltersfieldsetCtrl', { $scope: scope });

		scope.$digest();
	}));

	function getGearTypes() {
		return [{ "code": "OTT", "text": "OTT", "desc": "OTTER TWIN TRAWLS" }, { "code": "OT", "text": "OT", "desc": "OTTER TRAWLS (NOT SPECIFIED)" }, { "code": "PT", "text": "PT", "desc": "PAIR TRAWLS (NOT SPECIFIED)" }, { "code": "TX", "text": "TX", "desc": "OTHER TRAWLS (NOT SPECIFIED)" }, { "code": "DRB", "text": "DRB", "desc": "BOAT DREDGES" }, { "code": "DRH", "text": "DRH", "desc": "HAND DREDGES" }, { "code": "LNP", "text": "LNP", "desc": "PORTABLE LIFT NETS" }, { "code": "LNB", "text": "LNB", "desc": "BOAT-OPERATED LIFT NETS" }, { "code": "LNS", "text": "LNS", "desc": "SHORE-OPERATED STATIONARY LIFT NETS" }, { "code": "LN", "text": "LN", "desc": "LIFT NETS (NOT SPECIFIED)" }, { "code": "TBB", "text": "TBB", "desc": "BOTTOM TRAWLS - BEAM TRAWLS" }, { "code": "OTB", "text": "OTB", "desc": "BOTTOM TRAWLS - OTTER TRAWLS" }, { "code": "PTB", "text": "PTB", "desc": "BOTTOM TRAWLS - PAIR TRAWLS" }, { "code": "TBN", "text": "TBN", "desc": "BOTTOM TRAWLS - NEPHROPS TRAWLS" }, { "code": "TBS", "text": "TBS", "desc": "BOTTOM TRAWLS - SHRIMP TRAWLS" }, { "code": "TB", "text": "TB", "desc": "BOTTOM TRAWLS - NOT SPECIFIED" }, { "code": "OTM", "text": "OTM", "desc": "MIDWATER TRAWLS - OTTER TRAWLS" }, { "code": "PTM", "text": "PTM", "desc": "MIDWATER TRAWLS - PAIR TRAWLS" }, { "code": "TMS", "text": "TMS", "desc": "MIDWATER TRAWLS - SHRIMP TRAWLS" }, { "code": "TM", "text": "TM", "desc": "MIDWATER TRAWLS - NOT SPECIFIED" }, { "code": "PS", "text": "PS", "desc": "WITH PURSE LINES (PURSE SEINES)" }, { "code": "PS1", "text": "PS1", "desc": "- ONE BOAT OPERATED PURSE SEINES" }, { "code": "PS2", "text": "PS2", "desc": "- TWO BOATS OPERATED PURSE SEINES" }, { "code": "LA", "text": "LA", "desc": "WITHOUT PURSE LINES (LAMPARA)" }, { "code": "SB", "text": "SB", "desc": "BEACH SEINES" }, { "code": "SV", "text": "SV", "desc": "BOAT OR VESSEL SEINES" }, { "code": "SDN", "text": "SDN", "desc": "- DANISH SEINES" }, { "code": "SSC", "text": "SSC", "desc": "- SCOTTISH SEINES" }, { "code": "SPR", "text": "SPR", "desc": "- PAIR SEINES" }, { "code": "SX", "text": "SX", "desc": "SEINE NETS (NOT SPECIFIED)" }, { "code": "NK", "text": "NK", "desc": "GEAR NOT KNOW OR NOT SPECIFIED" }, { "code": "LLD", "text": "LLD", "desc": "DRIFTING LONGLINES" }, { "code": "LL", "text": "LL", "desc": "LONGLINES (NOT SPECIFIED)" }, { "code": "LTL", "text": "LTL", "desc": "TROLLING LINES" }, { "code": "LX", "text": "LX", "desc": "HOOKS AND LINES (NOT SPECIFIED)" }, { "code": "HAR", "text": "HAR", "desc": "HARPOONS" }, { "code": "HMP", "text": "HMP", "desc": "PUMPS" }, { "code": "HMD", "text": "HMD", "desc": "MECHANIZED DREDGES" }, { "code": "HMX", "text": "HMX", "desc": "HARVESTING MACHINES (NOT SPECIFIED)" }, { "code": "MIS", "text": "MIS", "desc": "MISCELLANEOUS GEAR" }, { "code": "RG", "text": "RG", "desc": "RECREATIONAL FISHING GEAR" }, { "code": "FPN", "text": "FPN", "desc": "STATIONARY UNCOVERED POUND NETS" }, { "code": "FPO", "text": "FPO", "desc": "POTS" }, { "code": "FYK", "text": "FYK", "desc": "FYKE NETS" }, { "code": "FSN", "text": "FSN", "desc": "STOW NETS" }, { "code": "FWR", "text": "FWR", "desc": "BARRIERS, FENCES, WEIRS, ETC." }, { "code": "FAR", "text": "FAR", "desc": "AERIAL TRAPS" }, { "code": "FIX", "text": "FIX", "desc": "TRAPS (NOT SPECIFIED)" }, { "code": "LHP", "text": "LHP", "desc": "HANDLINES AND POLE-LINES (HAND-OPERATED)" }, { "code": "LHM", "text": "LHM", "desc": "HANDLINES AND POLE-LINES (MECHANIZED)" }, { "code": "LLS", "text": "LLS", "desc": "SET LONGLINES" }, { "code": "FCN", "text": "FCN", "desc": "CAST NETS" }, { "code": "FG", "text": "FG", "desc": "FALLING GEAR (NOT SPECIFIED)" }, { "code": "GNS", "text": "GNS", "desc": "SET GILLNETS (ANCHORED)" }, { "code": "GND", "text": "GND", "desc": "DRIFTNETS" }, { "code": "GNC", "text": "GNC", "desc": "ENCIRCLING GILLNETS" }, { "code": "GNF", "text": "GNF", "desc": "FIXED GILLNETS (ON STAKES)" }, { "code": "GTR", "text": "GTR", "desc": "TRAMMEL NETS" }, { "code": "GTN", "text": "GTN", "desc": "COMBINED GILLNETS-TRAMMEL NETS" }, { "code": "GEN", "text": "GEN", "desc": "GILLNETS AND ENTANGLING NETS (NOT SPECIFIED)" }, { "code": "GN", "text": "GN", "desc": "GILLNETS (NOT SPECIFIED)" }];
	}
	function getReportTypes() {
		return [{
			code: "DECLARATION",
			description: "DECLARATION"
		},
		{
			code: "NOTIFICATION",
			description: "NOTIFICATION"
		}];
	}
	function getActivityType() {
		return [{ "code": "JOINT_FISHING_OPERATION", "text": "JFO", "desc": "A FISHING OPERATION WITH MORE THAN ONE VESSEL INVOLVED" }, { "code": "DEPARTURE", "text": "DEP", "desc": "DEPARTURE FROM A LOCATION." }, { "code": "ARRIVAL", "text": "ARR", "desc": "ARRIVAL IN A LOCATION" }, { "code": "AREA_ENTRY", "text": "ENTRY", "desc": "ENTRY INTO AN AREA" }, { "code": "AREA_EXIT", "text": "EXIT", "desc": "EXIT FROM AN AREA" }, { "code": "FISHING_OPERATION", "text": "FOP", "desc": "ACTIVITY IN CONNECTION WITH SEARCHING FOR FISH, SHOOTING, TOWING AND HAULING OF ACTIVE GEARS, SETTING, SOAKING, REMOVING/RESETTING OF PASSIVE GEARS AND REMOVAL OF ANY CATCH FROM THE GEAR, KEEP NETS OR FROM A TRANSPORT CAGE TO FATTENING/FARMING CAGES" }, { "code": "LANDING", "text": "LAN", "desc": "THE UNLOADING OF CATCHES OR PART THEREOF IN A PORT OR LANDING PLACE ON LAND" }, { "code": "DISCARD", "text": "DIS", "desc": "THE UNLOADING OF CATCHES OR PART THEREOF WHILE AT SEA" }, { "code": "TRANSHIPMENT", "text": "TRA", "desc": "THE UNLOADING OF CATCHES OR PART THEREOF FROM ONBOARD THE VESSEL TO ANOTHER VESSEL OR THE LOADING OF CATCHES ON BOARD FROM ANOTHER VESSEL" }, { "code": "RELOCATION", "text": "RLC", "desc": "OPERATION WHERE THE CATCH OR PART THEREOF IS TRANSFERRED OR MOVED FROM SHARED FISHING GEAR TO A VESSEL OR FROM A VESSEL’S HOLD OR ITS FISHING GEAR TO A KEEP NET, CONTAINER OR CAGE OUTSIDE THE VESSEL IN WHICH THE LIVE CATCH IS KEPT UNTIL LANDING." }];
	}

	function buildMocks() {
		mdrCacheServiceSpy.getCodeList.andCallFake(function (param) {
			if (param === 'GEAR_TYPE') {
				return {
					then: function (callback) {
						return callback(getGearTypes());
					}
				};
			} else if (param === 'FLUX_FA_REPORT_TYPE') {
				return {
					then: function (callback) {
						return callback(getReportTypes());
					}
				};
			} else {
				return {
					then: function (callback) {
						return callback(getActivityType());
					}
				};
			}
		});
	}

	it('should load the combo items', inject(function () {
		expect(mdrCacheServiceSpy.getCodeList.callCount).toBe(3);
	}));

});
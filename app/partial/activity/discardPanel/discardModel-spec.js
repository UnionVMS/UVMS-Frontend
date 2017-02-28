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
describe('Discard', function() {
    var data, summary;
    beforeEach(module('unionvmsWeb'));

    beforeEach(function() {
        data = getDiscardData();
        summary = finalSummary();
    });

    function getDiscardData() {
        return {
            "landingSummary": {
                "occurence": "2018-02-26T00:28:28",
                "landingTime": {
                    "startOfLanding": "2016-04-22T17:47:19",
                    "endOfLanding": "2017-07-05T14:14:58"
                }
            },
            "port": {
                "name": "Heparkef",
                "geometry": "POINT(-110.87483 -27.21663)"
            },
            "reportDoc": {
                "type": "NOTIFICATION",
                "dateAccepted": "2018-03-01T21:53:57",
                "id": "d9ecf171-6cbd-54ae-ae51-006ff9724b64",
                "refId": "9bc9ff39-4452-5039-953b-6e3f5687bcbe",
                "creationDate": "2017-02-28T10:40:37",
                "purposeCode": 1,
                "purpose": "Ni fumozudi enatug zittufed kim usion lipiwnip luziz aduke wovdifur pufbijkot zudgeuv jul dev con."
            }

        }
    }

    function finalSummary() {
        return {
            title: ':',
            subTitle: '',
            items: {
                occurence: '2018-02-26T00:28:28'
            },
            subItems: {
                startOfLanding: '2016-04-22T17:47:19',
                endOfLanding: '2017-07-05T14:14:58'
            }
        }
    };

    it('should instantiate a new empty discard object', inject(function(Discard) {
        var discard = new Discard();
        expect(discard).toEqual(jasmine.any(Object));
        expect(discard.landingSummary).toEqual(jasmine.any(Object));
        expect(discard.port).toEqual(jasmine.any(Object));
        expect(discard.reportDoc).toEqual(jasmine.any(Object));
    }));

    it('should properly build discard from json data', inject(function(Discard) {
        var discard = new Discard();
        discard.fromJson(data);
        expect(discard.landingSummary).toEqual(summary);
        expect(discard.port).toEqual(data.port);
        expect(discard.reportDoc).toEqual(data.reportDoc);
    }));

});

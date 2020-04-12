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
describe('reportVisibility', function() {
/*  TODO it's hard to mock locale service within the directive
  beforeEach(module('unionvmsWeb', function($provide, $translateProvider) {
       $provide.factory('locale', function() {
            return {
                getString: function(labelCode) {
                    if (labelCode === 'spatial.reports_table_share_label_private') {
                      return 'Private';
                    } else if (labelCode === 'spatial.reports_table_share_label_scope') {
                      return 'Scope';
                    } else if (labelCode === 'spatial.reports_table_share_label_public') {
                      return 'Public';
                    }
                }
            }
        });

       }));
  var scope,compile;

  beforeEach(inject(function($rootScope,$compile, $injector) {
    scope = $rootScope.$new();
    compile = $compile;


    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('usm/assets/translate/locale-en.json').respond({});
    $httpBackend.whenGET('/usm-administration/rest/ping').respond({});
    $httpBackend.whenGET('/config/rest/globals').respond({});
    $httpBackend.whenGET('/partial/common/error/error.html').respond({});
  }));
  it('static parameter ...', function() {

    var element = compile('<report-visibility visibility="private"/>')(scope);
    scope.$apply();
    //expect(element.text()).toBe('<span class="label label-default label-visibility" visibility="private">Private</span>');
                expect(element.text()).toBe('Private');
    <report-visibility visibility="scope"/>
    <span class="label label-warning label-visibility" visibility="scope">Scope</span>

    <report-visibility visibility="public"/>
    <span class="label label-success label-visibility" visibility="public">Public</span>


    

  }); */
});

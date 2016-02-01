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
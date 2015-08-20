describe('csvService', function() {

  beforeEach(module('unionvmsWeb'));

  it('should create a CSV file without throwing errors', inject(function(csvService, CSV, $q) {

    var data = [ ['a', 1], ['b', 2] ],
        header = ['letter', 'digit'],
        filename = 'test.csv';

    csvService.downloadCSVFile(data, header, filename);
  }));

});
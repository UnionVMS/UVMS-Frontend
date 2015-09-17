//To make sure envConfig is set during testing whe define it here
//When running the application, envConfig is set during the app bootstrapping but this
//some times take too long which makes the unit tests fail
console.info("Setting envConfig in envConfigForTest.js");
angular.module('unionvmsWeb').constant("envConfig", {});
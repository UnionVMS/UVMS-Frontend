------------------
UVMS widget:
  recentFluxAssets
------------------

This widget displays a sorted list of the number of vessels in the domestic zone.

It is mostly separate from Union-VMS, so it can be re-used in other applications.
For example, it is its own module and does not have dependencies to Union-VMS.

Uses two backend endpoints:
 /movement/rest/movement/listByAreaAndTimeInterval - lists movements in an area, for the requested time interval
 /asset/rest/asset/listGroupByFlagState - takes a list of asset GUIDs, and returns a list of objects (flagState, numberOfAssets)

To re-use this module:
 * copy this folder to your project
 * include the scripts (*.js files)
 * include the .less file
 * add activeFluxAssets as a dependency to one of your Angular modules
 * feel free to use the <recentFluxAssets/> directive anywhere


 Note #1:
  The wiget fetches data from a backend. Change the URL to reflect your setup.
  Variable remoteBaseUrl can be set in Angular config stage.

 Note #2:
  If used with Union-VMS backend, you must provide the appropriate 
  Authorization header by logging into Union-VMS with user credenials.

Note #3:
 If used within Union-VMS, the global stylesheets and translations do not
 affect this widget, so changes must be made to it specifically.

===============

Build distribution: (requires: nmp, grunt-cli)

 $ npm install && grunt dist

Then include these files in your app:
 * recentFluxAssets.full.min.js
 * recentFluxAssets.full.min.css

Done!

# Routing
UI-router is used to separate the app into a number of states. Each state defines at least one template and one controller, as well as the necessary configuration resources that need to be resolved ahead of switching to this state.

# Authentication
The user module is responsible for authenticating the current user by username and password. If successful, a JWT token is returned to the frontend and stored in the browser's local storage. This token is appended to every request's HTTP header by an interceptor added to the $http service.

The same interceptor acts when an asynchronous request is rejected with an HTTP 403 status, or similar. In this case, the app will immediately display a login screen for the user to re-authenticate, or be logged out.

Depending on the user's priviledges, different parts of the app may or may not be accessible.

# Configuration
Every module provides its own configuration state. This includes possible dropdown values, object types and other parameters.

# i18n
The app uses angular-translate to potentially display text in different languages depending on the user's preferences. However, there are currently no translations for languages other than English.

# Search
Many tabs have search forms that allow the user to search for objects in the backend.

The form inputs store their values in a common object called advancedSearchObject. Once the search button is pressed, these values are translated into a search request and sent to the backend in a request.

Because the backend is divided into microservices, it is sometimes necessary to perform multiple asynchronous request; for example, first fetching a list of mobile terminals and then requesting the vessels they are connected to for additional details.

### Saved searches
Searches can be saved to spare the user typing the same text over and over again. When a saved search is selected, the search form is re-populated with the values of the saved search, and a search is performed.

It is also possible to create static object groups (for example a group of vessels) by creating a saved search containing the UUIDs of one or more vessels.

# Form Validation
Most input fields do some sort of validation based on the format of the expected input, and mark field with invalid content along with a helpful message.

# REST
Objects such as assets, mobile terminals, configuration data and so on are fetched from backend during runtime by ansynchronout REST requests. The $q service is used to allow the app to resume processing once a response is received.

# Table paging and sorting
The backend typically only returns chunks of the search results as pages, along with the current page number and the total number of pages available. Because the backend does not take any desired ordering as an input, it will return the results in order of when the objects were created.

Any sorting done in frontend is only applied to the current page.

# Models
Although not strictly necessary, the various objects fetched from backend are transformed into custom JavaScript classes in frontend. The benefit is that changes in the backend model are easily applied to the frontend by changing only these classes.

# Naming
Sometimes names change, for example "assets" were initially called "vessels", and "movements" are sometimes called "positions". This is unfortunate.

# Common components

### Datepicker
A wrapper for the jQuery datetimepicker project, that displays dates in the user's format and time zone, but stores the values in the common format.

### Alerts
Presents alerts temporarily using Bootstrap alert styles.

### Dropdowns, multiselect dropdown & combo box
Wraps the Bootstrap dropdown with modifications.

### Unit conversion and formatting
Units of any value received from the backend are assumed to be:
- knots (for speeds)
- nautical miles (for distances)
- meters (for lengths)

The display values are being converted according to the current user settings.

### Date and time
Any timestamp or date/time received from backend should be assumed to be in UTC Zero time zone. It may not be explicitly apperent thou. The app converts these into the user's time zone and formats them correctly before displaying.

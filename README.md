# requestmanager

The requestmanager will be available as the global variable _rqmgr.
The objective of the requestmanager is to instrument the browser' native api's to create requests in such a way that the manager can filter out querystring parameters before the request is created.

Currently the following native features are covered:
- creation of a request (using javascript) via:
    - Images
    - Scripts
    - Iframes
- XHR
- Fetch
- sendBeacon

It is possible to revert back the instrumentation using the _rqmgr.restore... methods

The manager is to be considered a singleton.

The main reason for this code is to provide a way to make sure that third parties do not get any unwanted data from querystring parameters on the page.

The following methods/properties are the most usefull:
- _rqmgr.currentUrl: the url used as a basis for checking third party urls
- _rqmgr.checkUrl(string): validate and sanitize the given url based on the currentUrl
- _rmgr.whitelistKeys: array of strings representing the keys you want to whitelist
- _rqmgr.intercept(): starts the interception. you need to call this manually as it will not automatically start intercepting
- _rqmgr.restore(): remove our interceptors and revert back the changes made to the interceptees 

#TODO

check if sendBeacon works properly


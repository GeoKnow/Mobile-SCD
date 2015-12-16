Mobile Supply Chain Dashboard
===
The mobile supply chain dashboard enables operative personnel to make decisions on the go and gives them insight
into the state of the supply chain in real time. It is a mobile application that on one hand tackles smartphone
hardware limitations and delivers a mobile friendly view of the whole supply chain, while on the other leverages
unparalleled connectivity and accessibility of mobile devices to keep decision makers in the loop and allow them
to make decisions on the go. The developed component provides a mobile-friendly user interface that displays
information in a clean and concise way. On the other hand, advantages of mobile devices are exploited in order
to provide around-the-clock access to the supply chain, and to alert a decision maker about the potential problems.
The component relies on the previous work conducted in WP5 of the GeoKnow project, and operates on top of
the supply chain infrastructure defined in task T5.2.
How to build and deploy
---
GEM is an [Apache Cordova](http://cordova.apache.org/) / [Adobe Phonegap](http://phonegap.com/) project.
After the Apache Cordova is installed, the mobile application source code is easily compiled by simply executing
the following command from the desired CLI:
```
cordova build <platform>
```
where *&lt;platform&gt;* can be any of the Cordova/Phonegap supported platforms (e.g. *android*).
It is worth noting that the Phonegap equivalent of the Cordova command is *phonegap*.
To compile and deploy the application to the desired device, we execute:
```
cordova run <platform>
```
Configuration
---
Since the application depends on the Supply Chain Simulator which is a confidential component,
the default configuration uses mock simulator with a pre-defined scenario. To run the application on top of live
infrastructure, create your own parameters module in [parameters.js](www/js/services/parameters.js) by copying
one of the existing modules and changing the module name and parameter values (e.g. endpoint and dashboard URL).
After that, adjust parametersModule variable in [wirings.js](www/js/wirings.js) to point to you newly created module,
and set the messagingModule variable to _scm-comm-real_.
Download a pre-built package
---
Pre-built packages for Android are available in [the APK repository](http://geoknow.imp.bg.ac.rs/mobile-scm/apks).
APKs in the repository use the default configuration.
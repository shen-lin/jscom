JSCOM
======================
A light-weight component framework that supports NodeJS development. 
By using JSCOM, a software system is constructed as components bindings. 
It facilitates introspection of a constructed system and its 
meta-level properties at runtime, and allows this system to be reconfigured on the fly.

License: BSD

	
Development Setup
--------------------
	* Environment prerequisite: 
		Install Python, Java, and NodeJS. Require NodeJS 0.11 and above.
		Setup the Path environment variables for Python, Java, and NodeJS.
		
	* Required nodejs modules:
		cd jscom
		mocha:    npm install mocha
		istanbul: npm install istanbul
		should:   npm install should 
		log4js:   npm install log4js
		smartdoc: npm install smartdoc
		unirest:  npm install unirest
		
	* Build project
		cd jscom
		Build and test:  build.py
		Build and debug: build.py -debug
		Build, test, and generate API document: build.py -docgen

	* Build outputs:
		Disted code:   jscom/dist
		Logs:          jscom/logs
		Test coverage: jscom/coverage/lcov-report/index.html
	

	
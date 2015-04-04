JSCOM
======================

Requires Python, Java, and NodeJS installed and setup the environment variables

Required nodejs modules:
	cd %JSCOM_ROOT_DIR%/
	mocha: 
		npm install mocha
	istanbul:
		npm install istanbul
	should:
		npm install should 
	log4js:
		npm install log4js
	smartdoc	
		npm install smartdoc
		
Create Folders
	%JSCOM_ROOT_DIR%/logs
	%JSCOM_ROOT_DIR%/dist
		
Build Project
	cd %JSCOM_ROOT_DIR%/
	Build and test: build.py
	Build and debug: build.py -debug
	Build, test, and generate API document: build.py -docgen

Build outputs:
	Disted code: %JSCOM_ROOT_DIR%/dist
	Logs: %JSCOM_ROOT_DIR%/logs
	Test coverage reports: %JSCOM_ROOT_DIR%/coverage/lcov-report/index.html
	

API document generation
	
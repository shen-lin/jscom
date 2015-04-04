Requires Python, Java, and NodeJS installed and setup the environment variables

Required nodejs modules:
	cd %JSCOM_ROOT_DIR%/
	mocha.js: 
		npm install mocha
	istanbul.js:
		npm install istanbul
	should.js:
		npm install should 
	log4js.js:
		npm install log4js
		
Create Folders
	%JSCOM_ROOT_DIR%/logs
	%JSCOM_ROOT_DIR%/dist
		
Build Project
	cd %JSCOM_ROOT_DIR%/
	Run build.py or build.py -debug
	

Build outputs:
	Disted code: %JSCOM_ROOT_DIR%/dist
	Logs: %JSCOM_ROOT_DIR%/logs
	Test coverage reports: %JSCOM_ROOT_DIR%/coverage/lcov-report/index.html
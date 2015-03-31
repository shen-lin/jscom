Install nodejs modules:
	cd %JSCOM_ROOT_DIR%/
	mocha.js: 
		npm install mocha
	should.js:
		npm install should 
	log4js.js:
		npm install log4js
		

Build Project
	Requires python, Java, and NodeJS installed and setup the environment variables
	cd %JSCOM_ROOT_DIR%/build
	Run build.py
	Check output in %JSCOM_ROOT_DIR%/dist
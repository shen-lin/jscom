import os, sys
from subprocess import call
from subprocess import check_call

print('Start building JSCOM...')
# Change current working dir to jscompiler
jscomDir = os.getcwd()
jscompilerDir = jscomDir + "/jscompiler"
os.chdir(jscompilerDir)
# Dist JSCOM
call(["python", "build.py", "--include", "includes", "--warningoff", "--minify", "--output", "../dist/jscom.min.js"])
call(["python", "build.py", "--include", "includes", "--warningoff", "--output", "../dist/jscom.js"]);
# Change current working dir to jscom
os.chdir(jscomDir)
# Run mocha test
os.environ['PATH'] = os.environ['PATH'] + ";" + jscomDir + "/node_modules/.bin"
call("mocha", shell=True)
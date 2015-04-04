import os, sys, argparse
from subprocess import call
from subprocess import check_call

# Args parsing
parser = argparse.ArgumentParser()
parser.add_argument('-debug', action='store_true', help='Optional argument to activate NodeJS debug mode')
args = parser.parse_args()

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

if args.debug:
	call(["mocha", "debug"], shell=True)
else:
	call(["istanbul", "cover", "node_modules/mocha/bin/_mocha"], shell=True)
import os, sys, argparse, shutil
from subprocess import call
from subprocess import check_call


# Args parsing
parser = argparse.ArgumentParser()
parser.add_argument('-debug', action='store_true', help='Optional argument to activate NodeJS debug mode')
parser.add_argument('-docgen', action='store_true', help='Optional argument to generate API document')
args = parser.parse_args()

print('Start building JSCOM...')
# Change current working dir to jscompiler
jscomDir = os.getcwd()
jscompilerDir = jscomDir + "/jscompiler"
os.chdir(jscompilerDir)

# Create logs and dist dir
distDir = jscomDir + "/dist"
if os.path.isdir(distDir):
   shutil.rmtree(distDir)
if not os.path.isdir(distDir):
   os.makedirs(distDir)
logsDir = jscomDir + "/logs"
if not os.path.isdir(logsDir):
   os.makedirs(logsDir)

# Dist JSCOM
call(["python", "build.py", "--include", "includes", "--warningoff", "--minify", "--output", "../dist/jscom.min.js"])
call(["python", "build.py", "--include", "includes", "--warningoff", "--output", "../dist/jscom.js"]);
# Change current working dir to jscom
os.chdir(jscomDir)

shutil.copytree("src/api", "dist/JSCOM/api");

# Run mocha test
os.environ['PATH'] = os.environ['PATH'] + ";" + jscomDir + "/node_modules/.bin"
os.environ['NODE_PATH'] = jscomDir

if args.debug:
	call(["mocha", "debug"], shell=True)
else:
	call(["istanbul", "cover", "-i", "dist/**", "node_modules/mocha/bin/_mocha"], shell=True)
	if args.docgen:
		call(["smartDoc"], shell=True)
#!/usr/bin/env python

import argparse
import json
import os
import shutil
import sys
import tempfile


def main(argv=None):

	parser = argparse.ArgumentParser()
	parser.add_argument('--include', action='append', required=True)
	parser.add_argument('--warningoff', action='store_true', default=False)
	parser.add_argument('--minify', action='store_true', default=False)
	parser.add_argument('--output', default='../build/jscom.js')
	parser.add_argument('--sourcemaps', action='store_true', default=False)

	args = parser.parse_args()

	output = args.output

	# merge

	print(' * Building ' + output)

	# enable sourcemaps support

	if args.sourcemaps:
		sourcemap = output + '.map'
		sourcemapping = '\n//@ sourceMappingURL=' + sourcemap
		sourcemapargs = ' --create_source_map ' + sourcemap + ' --source_map_format=V3'
	else:
		sourcemap = sourcemapping = sourcemapargs = ''

	fd, path = tempfile.mkstemp()
	tmp = open(path, 'w')
	sources = []

	for include in args.include:
		with open('includes/' + include + '.json','r') as f: files = json.load(f)
		for filename in files:
			sources.append(filename)
			with open(filename, 'r') as f: tmp.write(f.read())

	tmp.close()

	# save
	warningOff = ""
	if args.warningoff is False:
		warningOff = "--warning_level=VERBOSE"
		
	if args.minify is False:
		shutil.copy(path, output)
		os.chmod(output, 0o664); # temp files would usually get 0600

	else:
		source = ' '.join(sources)
		cmd = 'java -jar compiler/compiler.jar --jscomp_off=globalThis %s --jscomp_off=checkTypes --language_in=ECMASCRIPT5_STRICT --js %s --js_output_file %s %s' % (warningOff, source, output, sourcemapargs)
		os.system(cmd)

		# header

		with open(output,'r') as f: text = f.read()
		with open(output,'w') as f: f.write('// JSCOM \n' + text + sourcemapping)
	
	os.close(fd)
	os.remove(path)


if __name__ == "__main__":
	main()

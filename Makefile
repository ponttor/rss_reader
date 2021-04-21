start:
	npx webpack-dev-server

setup:
	npm install

build:
	rm -rf dist
	NODE_ENV=production npx webpack

lint:
	npx eslint .

publish: 
	npm publish --dry run

watch:
	"webpack --watch",
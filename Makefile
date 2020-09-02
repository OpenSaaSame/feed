build:
	rm -rf .daml
	rm -rf daml2js
	rm -rf react/build
	daml build
	daml codegen js -o daml2js .daml/dist/*.dar
	cd react && yarn install --force --frozen-lockfile
	cd react && yarn build

ui:
	rm -rf react/build/
	cd react && yarn build

package:
	rm -rf deploy/	
	mkdir deploy
	cp .daml/dist/openwork-feeds-0.0.1.dar deploy/
	cd react && zip -r ../deploy/openwork-feeds-react.zip build/

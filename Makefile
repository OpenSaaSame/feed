BASENAME=$(shell yq r dabl-meta.yaml catalog.name)
VERSION=$(shell yq r dabl-meta.yaml catalog.version)

TAG_NAME=${BASENAME}-v${VERSION}
NAME=${BASENAME}-${VERSION}

ui_version := $(shell node -p "require(\"./react/package.json\").version")
dar := target/openwork-feed-0.0.1.dar
ui := target/openwork-feed-ui-$(ui_version).zip
dabl_meta := target/dabl-meta.yaml

.PHONY: package publish all clean

publish: package
	git tag -f "${TAG_NAME}"
	ghr -replace "${TAG_NAME}" "target/${NAME}.dit"

package: target/${NAME}.dit

target/${NAME}.dit: all
	cd target && zip ${NAME}.dit *

all: $(dar) $(ui) $(dabl_meta)

$(dabl_meta): dabl-meta.yaml
	cp dabl-meta.yaml $@

$(dar):
	mkdir -p $(@D)
	daml build
	cp .daml/dist/openwork-feed-0.0.1.dar $@

$(ui):
	mkdir -p $(@D)
	daml codegen js -o daml2js .daml/dist/*.dar
	cd react; \
		yarn install --force --frozen-lockfile; \
		yarn build; \
		zip -r openwork-feed-ui-$(ui_version).zip build
	mv react/openwork-feed-ui-$(ui_version).zip $@

clean:
	rm target/*
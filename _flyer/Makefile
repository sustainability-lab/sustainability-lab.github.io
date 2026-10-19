.PHONY: flyer all publish open clean
ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST)))/..)
DESIGN ?= $(shell awk '/^design:/{print $$2}' $(ROOT)/_flyer/flyer.yml)

flyer:
	cd $(ROOT) && uv run _flyer/build.py --variant $(DESIGN)

all:
	cd $(ROOT) && uv run _flyer/build.py --all

publish:
	cd $(ROOT) && uv run _flyer/build.py --variant $(DESIGN) --publish

open: flyer
	open $(ROOT)/_flyer/build/$(DESIGN)/flyer.pdf

clean:
	rm -rf $(ROOT)/_flyer/build

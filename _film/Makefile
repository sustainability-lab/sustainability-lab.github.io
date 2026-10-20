# Sustainability Lab intro film. See README.md.
#   make -C _film            prep → sound → render → master → web files
#   make -C _film studio     live preview in the browser (scrub, edit, see changes)
.PHONY: film 4k prep sfx render master web posters studio layers clean
ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST)))/..)
FILM := $(ROOT)/_film

film: prep sfx render master web posters

node_modules: package.json
	cd $(FILM) && npm install --no-audit --no-fund && touch node_modules

prep:
	cd $(ROOT) && uv run _film/scripts/prep.py

sfx:
	cd $(ROOT) && uv run _film/scripts/sfx.py

render: node_modules
	cd $(FILM) && npx remotion render src/index.ts LabFilm out/lab-film-raw.mp4 --codec=h264 --crf=16

master:
	cd $(FILM) && scripts/master.sh out/lab-film-raw.mp4 out/lab-film.mp4

# 3840×2160 master for YouTube (vector layers and canvases render at 2×)
4k: node_modules prep sfx
	cd $(FILM) && npx remotion render src/index.ts LabFilm out/lab-film-4k-raw.mp4 --codec=h264 --crf=14 --scale=2
	cd $(FILM) && scripts/master.sh out/lab-film-4k-raw.mp4 out/lab-film-4k.mp4

web:
	cd $(FILM) && scripts/web.sh out/lab-film.mp4 out/web

# the homepage poster (committed) and a 1280×720 thumbnail for YouTube or social posts
posters: node_modules
	cd $(FILM) && npx remotion still src/index.ts PosterWeb out/web/poster-web.png && npx remotion still src/index.ts Poster out/web/poster.png
	magick $(FILM)/out/web/poster-web.png -resize 1600x900 -quality 82 -strip $(ROOT)/images/film/poster.jpg
	magick $(FILM)/out/web/poster.png -resize 1280x720 -quality 88 $(FILM)/out/web/thumbnail-1280.jpg

studio: node_modules prep sfx
	cd $(FILM) && npx remotion studio src/index.ts

# rare: rebuild the committed data layers (maps, kilns, stations, signals) from the source repositories
layers:
	cd $(ROOT) && uv run _film/scripts/build_layers.py

clean:
	rm -rf $(FILM)/out $(FILM)/public

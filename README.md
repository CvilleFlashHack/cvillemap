# Cvillization Map
Map the innovation ecosystem around Charlottesville!

Find this site live at: [http://cvillization.com/](http://cvillization.com)

Architecture Overview

 - Use Google Forms to populate a Google Docs Spreadsheet which serves as a backend for the static HTML of the website


Installing JavaScript Libraries (only use when updating libraries)

- Install "bower"
- "bower install jquery-sheetrock"
- "bower install mapbox.js"
- "bower install bootstrap"
- "bower install leaflet.markercluster"
- "bower install Leaflet/Leaflet.fullscreen"
- add necessary libraries and css to head of file


The Map Itself

- the underlying map tiles and style come from Mapbox (not the data points themselves)
- data points are being grabbed from a google doc spreadsheet

Deployment Workflow
- Commit to master, then merge to the "gh-pages" branch and push
- Github pages is used to statically host the site and the CNAME file is the pointer for the domain (see [here.](https://help.github.com/articles/creating-project-pages-manually/))
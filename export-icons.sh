#!/bin/bash

 # Create output directory, wiping it if it exists
 rm -rf out
 mkdir -p out

 # Get list of icon IDs from the SVG file
 echo "Extracting icon IDs from SVG file..."
 icon_ids=$(xmlstarlet sel -t -m "//*[@id='id-icon-collection']/*[@id]" -v "@id" -n graphics/icons-opt-test.svg 2>&1)
 
 if [ $? -ne 0 ]; then
   echo "ERROR: Failed to extract icon IDs. XMLStarlet output:"
   echo "$icon_ids"
   exit 1
 fi
 
 if [ -z "$icon_ids" ]; then
   echo "ERROR: No icons found in SVG file. Check if id-icon-collection exists."
   exit 1
 fi
 
 echo "Found $(echo "$icon_ids" | wc -l) icons to process"

 # Add SVG header and namespace
 SVG_HEADER='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
 version="1.1">'
 SVG_FOOTER='</svg>'

 # Export each icon
 for icon_id in $icon_ids; do
   echo "Exporting $icon_id..."

   # Extract the icon's XML content
   icon_content=$(xmlstarlet sel -t -c "//*[@id='$icon_id']" graphics/icons-opt-test.svg)

   # Write to file with SVG header/footer
   echo "$SVG_HEADER" > "out/${icon_id}.svg"
   echo "$icon_content" >> "out/${icon_id}.svg"
   echo "$SVG_FOOTER" >> "out/${icon_id}.svg"
 done

 echo "Done! Exported icons to out/ directory"


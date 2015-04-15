#!/bin/bash

for PLUGIN in gills tacklebox
do
   if [ -e ${PLUGIN}.js ];
   then
      #node ${PLUGIN}.js > ${PLUGIN}.log &
      echo "Starting ${PLUGIN}"
      node ${PLUGIN}.js &
   else 
      echo "missing ${PLUGIN}.js.  Please copy from the -example file"
   fi
done

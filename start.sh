#!/bin/bash
if [ -e server.js ];
then
   node server.js
else 
   echo "missing server.js.  Please copy from the -example file"
fi

#!/bin/bash

echo "Killing procs"
ps auxww | grep tacklebox | grep -v grep | awk '{print $2}' | xargs kill
ps auxww | grep gills | grep -v grep | awk '{print $2}' | xargs kill

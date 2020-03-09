#!/bin/bash

for file in *.zip
do
	unzip $file -d /data/$(basename $file .zip)
done

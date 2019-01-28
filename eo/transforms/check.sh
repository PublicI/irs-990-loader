#!/bin/bash

for file in $(find $1*.txt); do
	wget -S --spider -P $2 -i $file
done

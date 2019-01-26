#!/bin/bash

REGIONS="1 2 3 4"

for region in $REGIONS; do
	wget -N -P $1 "https://www.irs.gov/pub/irs-soi/eo"$region".csv"
done

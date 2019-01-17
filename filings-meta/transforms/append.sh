#!/bin/bash

find $1 -type f | xargs BASE=$(basename $index .csv) YEAR=${base#index_}; sed -e 's/$/,'$year'/' $index > $2/index_$year.csv

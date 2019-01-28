#!/bin/bash

for file in $(find $1*.csv); do
    base=$(basename $file .csv)
    year=${base#index_};
    tr -d '\r' < $file | sed -e 's/MOSTYN FOUNDATION INC CO SILVERCREST ASSET ,AMAGEMENT/"MOSTYN FOUNDATION INC CO SILVERCREST ASSET ,AMAGEMENT"/' | sed -e 's/$/,'$year'/' > $2/$base.csv
done

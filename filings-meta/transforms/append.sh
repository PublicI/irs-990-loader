#!/bin/bash

for f in $(find $1*.csv); do
    base=$(basename $f .csv)
    year=${base#index_};
    tr -d '\r' < $f | sed -e 's/MOSTYN FOUNDATION INC CO SILVERCREST ASSET ,AMAGEMENT/"MOSTYN FOUNDATION INC CO SILVERCREST ASSET ,AMAGEMENT"/' | sed -e 's/$/,'$year'/' > $2/$base.csv
done

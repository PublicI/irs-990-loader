#!/bin/bash

#wget -N -P ../../data/ https://s3.amazonaws.com/irs-form-990/index.json 
for year in 2011 2012 2013 2014 2015 2016 2017 2018 2018
do
    aws s3 cp s3://irs-form-990/index_$year.json ../../data/meta
done
node --max-old-space-size=4000 ./load.js

#if [ "$DB_DRIVER" = "postgres" ]
#then
#    for file in ../../data/meta/*.csv
#    do
#        psql -h $DB_HOST -U $DB_USER -p $DB_PORT $DB_NAME -c "\copy irs990_filings_meta FROM '$file' CSV HEADER;"
#    done
#else
#    echo -e "DB_DRIVER not set or not to postgres, not loading\n"
#fi

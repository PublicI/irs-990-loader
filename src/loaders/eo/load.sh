#!/bin/bash

wget -N -P ../../data/eo/ https://www.irs.gov/pub/irs-soi/eo1.csv
wget -N -P ../../data/eo/ https://www.irs.gov/pub/irs-soi/eo2.csv
wget -N -P ../../data/eo/ https://www.irs.gov/pub/irs-soi/eo3.csv
wget -N -P ../../data/eo/ https://www.irs.gov/pub/irs-soi/eo4.csv

if [ "$DB_DRIVER" = "postgres" ]
then
    psql -h $DB_HOST -U $DB_USER -p $DB_PORT $DB_NAME  < load.sql
else
    echo -e "DB_DRIVER not set or not to postgres, not loading\n"
fi
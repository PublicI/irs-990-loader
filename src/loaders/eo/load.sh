#!/bin/bash

wget -N -i https://www.irs.gov/pub/irs-soi/eo1.csv -P ../../data/eo/
wget -N -i https://www.irs.gov/pub/irs-soi/eo2.csv -P ../../data/eo/
wget -N -i https://www.irs.gov/pub/irs-soi/eo3.csv -P ../../data/eo/
wget -N -i https://www.irs.gov/pub/irs-soi/eo4.csv -P ../../data/eo/

if [ "$DB_DRIVER" = "postgres" ]
then
    psql -h $DB_HOST -U $DB_USER -p $DB_PORT $DB_NAME  < load.sql
else
    echo -e "DB_DRIVER not set or not to postgres, not loading\n"
fi
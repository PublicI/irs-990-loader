#!/bin/bash

# mkdir ../data/stats/
# wget -N -P ../data/stats/ https://www.irs.gov/pub/irs-soi/18eoextractez.xlsx
# wget -N -P ../data/stats/ https://www.irs.gov/pub/irs-soi/18eoextract990.xlsx
# wget -N -P ../data/stats/ https://www.irs.gov/pub/irs-soi/17eofinextractEZ.dat
# wget -N -P ../data/stats/ https://www.irs.gov/pub/irs-soi/17eofinextract990.dat
# wget -N -P ../data/stats/ https://www.irs.gov/pub/irs-soi/16eofinextract990.dat
# wget -N -P ../data/stats/ https://www.irs.gov/pub/irs-soi/16eofinextractez.dat
# wget -N -P ../data/stats/ https://www.irs.gov/pub/irs-soi/16eofinextract990pf.dat
# wget -N -P ../data/stats/ https://www.irs.gov/pub/irs-soi/15eofinextract990.dat.dat
# wget -N -P ../data/stats/ https://www.irs.gov/pub/irs-soi/15eofinextractEZ.dat
# wget -N -P ../data/stats/ https://www.irs.gov/pub/irs-soi/15eofinextract990pf.dat
# wget -N -P ../data/stats/ https://www.irs.gov/pub/irs-soi/14eofinextract990.zip
# unzip ../data/stats/14eofinextract990.zip -d ../data/stats/
# wget -N -P ../data/stats/ https://www.irs.gov/pub/irs-soi/14eofinextract990ez.zip
# unzip ../data/stats/14eofinextract990ez.zip -d ../data/stats/
# wget -N -P ../data/stats/ https://www.irs.gov/pub/irs-soi/14eofinextract990pf.zip
# unzip ../data/stats/14eofinextract990pf.zip -d ../data/stats/
# wget -N -P ../data/stats/ https://www.irs.gov/pub/irs-soi/13eofinextract990.zip
# unzip ../data/stats/13eofinextract990.zip -d ../data/stats/
# wget -N -P ../data/stats/ https://www.irs.gov/pub/irs-soi/13eofinextract990ez.zip
# unzip ../data/stats/13eofinextract990ez.zip -d ../data/stats/
# wget -N -P ../data/stats/ https://www.irs.gov/pub/irs-soi/13eofinextract990pf.zip
# unzip ../data/stats/13eofinextract990pf.zip -d ../data/stats/
# wget -N -P ../data/stats/ https://www.irs.gov/pub/irs-soi/12eofinextract990.zip
# unzip ../data/stats/12eofinextract990.zip -d ../data/stats/
# wget -N -P ../data/stats/ https://www.irs.gov/pub/irs-soi/12eofinextract990ez.zip
# unzip ../data/stats/12eofinextract990ez.zip -d ../data/stats/
# wget -N -P ../data/stats/ https://www.irs.gov/pub/irs-soi/12eofinextract990pf.zip
# unzip ../data/stats/12eofinextract990pf.zip -d ../data/stats/

psql < load.sql

# if [ "$DB_DRIVER" = "postgres" ]
# then
#     psql -h $DB_HOST -U $DB_USER -p $DB_PORT $DB_NAME  < load.sql
# else
#     echo -e "DB_DRIVER not set or not to postgres, not loading\n"
# fi

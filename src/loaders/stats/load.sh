#!/bin/bash

mkdir ../../data/stats/
wget -N -P ../../data/stats/ https://www.irs.gov/pub/irs-soi/15eofinextract990.dat.dat
wget -N -P ../../data/stats/ https://www.irs.gov/pub/irs-soi/15eofinextractEZ.dat
wget -N -P ../../data/stats/ https://www.irs.gov/pub/irs-soi/15eofinextract990pf.dat
wget -N -P ../../data/stats/ https://www.irs.gov/pub/irs-soi/14eofinextract990.zip
unzip ../../data/stats/14eofinextract990.zip -d ../../data/stats/
wget -N -P ../../data/stats/ https://www.irs.gov/pub/irs-soi/14eofinextract990ez.zip
unzip ../../data/stats/14eofinextract990ez.zip -d ../../data/stats/
wget -N -P ../../data/stats/ https://www.irs.gov/pub/irs-soi/14eofinextract990pf.zip
unzip ../../data/stats/14eofinextract990pf.zip -d ../../data/stats/
wget -N -P ../../data/stats/ https://www.irs.gov/pub/irs-soi/13eofinextract990.zip
unzip ../../data/stats/13eofinextract990.zip -d ../../data/stats/
wget -N -P ../../data/stats/ https://www.irs.gov/pub/irs-soi/13eofinextract990ez.zip
unzip ../../data/stats/13eofinextract990ez.zip -d ../../data/stats/
wget -N -P ../../data/stats/ https://www.irs.gov/pub/irs-soi/13eofinextract990pf.zip
unzip ../../data/stats/13eofinextract990pf.zip -d ../../data/stats/
wget -N -P ../../data/stats/ https://www.irs.gov/pub/irs-soi/12eofinextract990.zip
unzip ../../data/stats/12eofinextract990.zip -d ../../data/stats/
wget -N -P ../../data/stats/ https://www.irs.gov/pub/irs-soi/12eofinextract990ez.zip
unzip ../../data/stats/12eofinextract990ez.zip -d ../../data/stats/
wget -N -P ../../data/stats/ https://www.irs.gov/pub/irs-soi/12eofinextract990pf.zip
unzip ../../data/stats/12eofinextract990pf.zip -d ../../data/stats/

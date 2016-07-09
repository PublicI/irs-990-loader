#!/bin/bash

mkdir ../../../doc
wget -N -P ../../../doc https://www.irs.gov/pub/irs-schema/efile990x_2016v1.0.zip
unzip ../../../doc/efile990x_2016v1.0.zip -d ../../../doc/
wget -N -P ../../../doc https://www.irs.gov/pub/irs-schema/efile990x_2015v2.1-12142015.zip
unzip ../../../doc/efile990x_2015v2.1-12142015.zip -d ../../../doc/
wget -N -P ../../../doc https://www.irs.gov/pub/irs-schema/efile990x_2014v6.0_09082015.zip
unzip ../../../doc/efile990x_2014v6.0_09082015.zip -d ../../../doc/
wget -N -P ../../../doc https://www.irs.gov/pub/irs-schema/efile990x_2013v4.0.zip
unzip ../../../doc/efile990x_2013v4.0.zip -d ../../../doc/

#!/bin/bash

find $1*.csv -type f) | xargs psql -c "\copy irs990_filings_meta FROM '$index' CSV HEADER;"

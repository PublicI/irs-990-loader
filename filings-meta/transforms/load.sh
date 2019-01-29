#!/bin/bash

psql -f create.sql

for file in $(find $1*.csv); do
    base=$(basename $file .csv)
    year=${base#index_};

    psql -c "START TRANSACTION;

    DELETE
    FROM irs990_filings_meta
    WHERE release_year = '"$year"';

    COPY irs990_filings_meta
    FROM STDIN CSV HEADER;

    COMMIT TRANSACTION;" < $file
done

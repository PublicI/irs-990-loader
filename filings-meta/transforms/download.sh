#!/bin/bash

for file in $(find $1*.csv); do
    aws s3 cp s3://irs-form-990/$(basename $file) $2  --no-sign-request
done

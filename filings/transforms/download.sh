#!/bin/bash

for f in $(find $1*.xml); do
    aws s3 cp s3://irs-form-990/$(basename $f) $2  --no-sign-request
done

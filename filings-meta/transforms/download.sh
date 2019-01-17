#!/bin/bash

find $1 -type f | xargs aws s3 cp s3://irs-form-990/$(basename $index) $2

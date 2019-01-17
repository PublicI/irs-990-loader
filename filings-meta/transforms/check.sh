#!/bin/bash

INDEX_LIST=$(aws s3api list-objects --bucket irs-form-990 --query 'Contents[].{Key: Key, ETag: ETag, Size: Size}' --prefix index --output text | grep .csv)

while read etag key size; do
    echo "$etag $size" > $1$key;
done < <(echo "$INDEX_LIST")

#!/bin/bash

OBJECT_LIST=$(psql -c "
SELECT object_id
FROM irs990_filings_meta
LEFT JOIN irs990_filings USING (object_id)
WHERE irs990_filings.object_id IS null
LIMIT 5000
"  --tuples-only)

for object_id in $OBJECT_LIST; do
    touch $1$object_id".xml";
done

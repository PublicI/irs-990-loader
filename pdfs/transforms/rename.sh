#!/bin/bash

find /data -type f > files.txt
psql -c "\copy irs990_docs FROM 'files.txt'"
psql -c "CREATE INDEX ON irs990_docs USING gin (path gin_trgm_ops); analyze irs990_docs;"
psql -c "\copy (SELECT 'mv "' || path || '" "' || regexp_replace(path, '/([0-9]+)_','/' || replace(name,'/',' ') || '_\1_') || '"' FROM (SELECT (regexp_matches(path, '/([0-9]+)_'))[1] AS ein, path FROM irs990_docs) AS docs JOIN irs990_orgs USING (ein)) to 'rename-files.sh'"
chmod +x rename-files.sh

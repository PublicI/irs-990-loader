#!/bin/bash

wget -N -P ../../data/ https://s3.amazonaws.com/irs-form-990/index.json
node --max-old-space-size=4000 ./load.js
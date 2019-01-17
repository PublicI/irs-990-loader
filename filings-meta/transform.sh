#!/bin/bash

mkdir -p out1
mkdir -p out2
mkdir -p out3
./transform/check.sh ./out1/
./transform/download.sh ./out1/ ./out2/
./transform/append.sh ./out2/ ./out3/
./transform/load.sh ./out3/

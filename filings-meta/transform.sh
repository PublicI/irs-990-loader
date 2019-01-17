#!/bin/bash

mkdir -p out1
mkdir -p out2
mkdir -p out3
# ./transforms/check.sh ./out1/
# ./transforms/download.sh ./out1/ ./out2/
# ./transforms/append.sh ./out2/ ./out3/
./transforms/load.sh ./out3/

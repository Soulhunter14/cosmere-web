#!/bin/bash
# usage: pg.sh file from to  -> prints PDF pages [from..to] (1-indexed) separated by markers
awk -v f="$2" -v t="$3" 'BEGIN{RS="\f"} NR>=f && NR<=t {print "=== PDF PAGE " NR " ==="; print}' "$1" | grep -v '^\s*$'

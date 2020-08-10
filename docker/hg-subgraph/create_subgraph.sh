#!/bin/sh

set -e # exit when any command fails

waitport() {
    while ! nc -z $1 $2 ; do sleep 1 ; done
}

waitport graph-node 8000

echo "Creating gnosis/hg at http://graph-node:8020"
graph create --node http://graph-node:8020 gnosis/hg
#!/bin/sh
set -e

# Substitute environment variables into the icecast config before starting.
envsubst < /etc/icecast2/icecast.xml > /tmp/icecast.xml

exec icecast2 -c /tmp/icecast.xml

#!/usr/bin/env bash

PROJECT_DIR=/var/www/rhythm-place
systemctl stop rhythm-liquidsoap rhythm-icecast
cp -f $PROJECT_DIR/files/rhythm.liq /etc/liquidsoap/rhythm.liq
cp -f $PROJECT_DIR/files/rhythm.xml /etc/icecast2/rhythm.xml
systemctl daemon-reload
systemctl start rhythm-liquidsoap rhythm-icecast
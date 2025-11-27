#!/usr/bin/env bash

sudo /usr/bin/systemctl restart rhythm.service
sudo /usr/bin/systemctl restart rhythm-liquidosoap.service
sudo /usr/bin/systemctl restart rhythm-icecast2.service
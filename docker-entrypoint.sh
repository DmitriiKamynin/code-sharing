#!/bin/sh
nginx -g "daemon off;" & node packages/backend/dist/main.js

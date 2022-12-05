#!/bin/bash

# This script packages SvelteKit for deployment on a Linux server
# NOTE: this script needs to run after `sveltekit-package-electron.js`

# Move packaged SvelteKit to /linux-server/canutin (without override existing files in destination folder)
mv -n ./resources/sveltekit/* ./linux-server/canutin

# Create a tar file of the /linux-server/canutin folder files
cd linux-server
tar -czvf ../dist/canutin-server_$APP_VERSION-linux-x64.tar.gz ./canutin/

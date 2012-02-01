#!/usr/bin/env bash
#
# Push locally edited sources to ~/Activities/ShockTherapy.activity/
# on a remote computer (or emulator) running Sugar. The only argument
# is the remote host name, which defaults to "xo" if omitted.
#
# Here is an example ~/.ssh/config section for an emulator running a
# "Sugar on a Stick" livecd, with netorking configured to forward
# localhost:2222 connections to port 22 on the emulated machine:
#
#   Host xo
#     User liveuser
#     HostName localhost
#     Port 2222
#
REMOTE=$1
[ -z "$REMOTE" ] && REMOTE=xo
LOCAL_BASE_DIR=${BASH_SOURCE[0]}
LOCAL_BASE_DIR=${LOCAL_BASE_DIR%/*}
BASE_URI=$REMOTE:Activities/ShockTherapy.activity
set -e
rsync -avz --delete \
--exclude='*.py[co]' \
--exclude=/web \
"$LOCAL_BASE_DIR/ShockTherapy.activity/" \
"$BASE_URI/"

rsync -avz --delete "$LOCAL_BASE_DIR/../web/" \
"$BASE_URI/web/"

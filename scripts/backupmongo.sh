#!/bin/bash

if [ "$1" = "" ] ; then
	echo "Usage: $0 <backupname>"
	exit
fi

BACKUP_NAME="$1"

mongodump --host "localhost:27000" --archive="sobox-$BACKUP_NAME.gz" --gzip --db sobox

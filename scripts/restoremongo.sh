#!/bin/bash

if [ "$1" =  "" ] ; then
	echo "Usage: $0 <backupname>"
	exit
fi

BACKUP_NAME="$1"
FILENAME="sobox-$BACKUP_NAME.gz"

if [ ! -f "$FILENAME" ] ; then
  echo "Missing filename $FILENAME"
  exit 1
fi

mongo localhost:27000/sobox --eval "db.dropDatabase()"

mongorestore --host "localhost:27000" --archive="$FILENAME" --gzip

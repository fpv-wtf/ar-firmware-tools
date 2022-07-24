#!/usr/bin/env bash

set -e
#set -x

KERNEL=$1

if [ $# -lt 1 ]; then
    echo "usage:"
    echo "$0 {vmlinuz} [rootfs_folder]"
    exit 1
fi

if [ $# -lt 2 ]; then
    TARGET_FOLDER="$(basename $KERNEL .img)_rootfs"
else
    TARGET_FOLDER=$2
fi

make_temp_dir () {
  TMP_DIR=$(mktemp -d /tmp/lz4rootfs.XXXXXX)
  echo "Using temporary directory: $TMP_DIR"
}

cleanup () {
  rm -rf $TMP_DIR
}

make_temp_dir

kernel_pos=`grep -P -a -b -m 1 --only-matching '\x02\x21\x4c\x18' $KERNEL | \
	cut -f 1 -d : 2>/dev/null | awk '(int($0)<50000){print $0;exit}'`

dd bs=1M if=$KERNEL of=$TMP_DIR/kernel.lz4 skip=$kernel_pos bs=1M iflag=skip_bytes,count_bytes
unlz4 -f $TMP_DIR/kernel.lz4 $TMP_DIR/kernel.raw  || true 

rootfs_pos=`grep -P -a -b -m 1 --only-matching '\x02\x21\x4c\x18' $TMP_DIR/kernel.raw | \
	cut -f 1 -d : 2>/dev/null`

dd bs=1M if=$TMP_DIR/kernel.raw of=$TMP_DIR/rootfs.lz4 skip=$rootfs_pos bs=1M iflag=skip_bytes,count_bytes
unlz4 -f $TMP_DIR/rootfs.lz4 $TMP_DIR/rootfs.cpio || true 

mkdir -p $TARGET_FOLDER
cd $TARGET_FOLDER
cpio -id < $TMP_DIR/rootfs.cpio || true 

cleanup
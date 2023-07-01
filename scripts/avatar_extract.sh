#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
OTRA="${SCRIPT_DIR}/../otra.js"
EXT4="python3 ${SCRIPT_DIR}/../../ext4/ext4_cp.py"
KERNEL_EXTRACT=${SCRIPT_DIR}/lz4_rootfs_extract.sh

IMAGE=$1

#set -x
set -e

if [ $# -lt 1 ]; then
    echo "usage:"
    echo "$0 {otra_image} [target_folder]"
    exit 1
fi

if [ $# -lt 2 ]; then
    TARGET_FOLDER="$(basename $IMAGE .img)_extracted"
else
    TARGET_FOLDER=$2
fi

make_temp_dir () {
  TMP_DIR=$(mktemp -d /tmp/otra.XXXXXX)
  echo "Using temporary directory: $TMP_DIR"
}

cleanup () {
  rm -rf $TMP_DIR
}

extract_otra () {
    $OTRA extract $1 $2
}

show_otra () {
    $OTRA info $1
}

recurse_otra () {
    for f in $TMP_DIR/*.img; do 
        if [ "$(dd if=$f bs=4 count=1 status=none)" == "OTRA" ]; then
            extract_otra $f "${f}_extracted" 
            if [ -f "${f}_extracted/rom.img" ]; then
                mv "${f}_extracted/rom.img" $f
                rm -rf "${f}_extracted"
            fi
        fi
    done
}

function extract_kernel () {
    for f in $TMP_DIR/kernel*.img; do 
        if [ -f "$f" ]; then
            $KERNEL_EXTRACT $f "$TMP_DIR/filesystem"
        fi
    done
}

function extract_uiapp () {
    if [ -f $TMP_DIR/uiapp.img ]; then
        f=$TMP_DIR/uiapp.img
        mkdir -p $TMP_DIR/filesystem/gui
        type=$(file $f)
        case $type in

            *"jffs2"*)
                jefferson -f -d $TMP_DIR/filesystem/gui $f
                rm $f
                ;;
            *"ext4"*)
                $EXT4 -R ${f}:. $TMP_DIR/filesystem/gui
                rm $f
                ;;
            *)
                echo  "unknown file system type: $type"
                ;;
        esac
    fi
}

function extract_userapp () {
    for f in $TMP_DIR/userapp*.img; do 
        mkdir -p $TMP_DIR/filesystem/local
        type=$(file $f)
        case $type in

            *"jffs2"*)
                jefferson -f -d $TMP_DIR/filesystem/local $f
                rm $f
                ;;
            *"ext4"*)
                $EXT4 -R ${f}:. $TMP_DIR/filesystem/local
                rm $f
                ;;
            *)
                echo  "unknown file system type: $type"
                ;;
        esac
    done
}

function convert_dtb () {
    for f in $TMP_DIR/dtb*.img; do 
        dtc -I dtb -O dts $f -o "$TMP_DIR/$(basename $f .img).dts"
    done
}

function move_result () {
    if [ -d "$TARGET_FOLDER" ]; then
        rm -rf "$TARGET_FOLDER"
    fi
    mkdir -p $TARGET_FOLDER
    mv $TMP_DIR/* $TARGET_FOLDER/
    echo "output in $TARGET_FOLDER"
}

make_temp_dir
show_otra $IMAGE
extract_otra $IMAGE $TMP_DIR
recurse_otra
extract_kernel
extract_userapp
extract_uiapp
convert_dtb

move_result
cleanup
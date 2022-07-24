## Artosyn Firmware Tools

Tools to deal with Artosyn ARTO v4 firmware image files. Inspired by [dji-firmware-tools](https://github.com/o-gs/dji-firmware-tools).

## Installing
    git clone https://github.com/fpv-wtf/ar-firmware-tools
    cd ar-firmware-tools
    npm install

## Usage
    otra.js <command>

    Commands:
    otra.js extract <image> [folder]  extract the OTRA image
    otra.js info <image>              show info on the OTRA image

    Options:
    --help     Show help                                 [boolean]
    --version  Show version number                       [boolean]

## Scripts
In order to make deep extraction of firmware packges easier some helper scripts are included. These scripts target Ubuntu Linux.

First, make sure you install [jefferson](https://github.com/sviehb/jefferson) for exrtacting JFFS2 file systems. Additionally, you'll need a copy of mefisto's [ext4 tools](https://github.com/mefistotelis/ext4) in the parent directory of ar-firmware-tools. Finally, install the lz4, cpio and device-tree-compiler packages for Ubuntu.

You can achieve this by running (presuming starting in the ar-firmware-tools folder):

    sudo apt update
    sudo apt install python3-pip liblzo2-dev cpio device-tree-compiler lz4
    git clone https://github.com/sviehb/jefferson.git ../jefferson
    cd ../jefferson
    sudo python3 -m pip install -r requirements.txt
    sudo python3 setup.py install
    git clone https://github.com/mefistotelis/ext4 ../ext4
    cd ../ar-firmware-tools

### Deep Extract Avatar FW
Use `scripts/avatar_extract.sh ${otra_image} [target_folder]` to deeply extract an Avatar_*.img firwmare update. Eg:

    scripts/avatar_extract.sh Avatar_Gnd_23.23.4.img

This will:
 - Extract the top level OTRA image
 - Extract any child OTRA images (effectively just stripping the OTRA header as they are all simple V1 images)
 - Extract the kernel initramfs ("rootfs") out of the kernel image to $target_folder/filesystem
 - Extract the JFFS2 or EXT4 userapp partition to $target_folder/filesystem
 - Convert the dtb to dts (human readable format)

### Extract rootfs from lz4 vmlinuz
If you just want to extract an lz4 rootfs out of a self extracint lz4 kernel image (u-boot or vmlinuz) do the following:

    scripts/lz4_rootfs_extract.sh vmlinuz rootfs_folder

## Format Definition
Defined using [Kaitai](https://kaitai.io/) see [otra.ksy](./otra.ksy). You can use the [Kaitai IDE](https://ide.kaitai.io/) to fill in the blanks or explore files.

To renegerate the javascript bindings: 

    ksc --target javascript --outdir otra_reader otra.ksy

Replace 'javascript' with your language of choice supported by Kaitai and have fun.

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

## Tips
To make the ext4 file system from Avatar Sky mountable:

    dd if=/dev/zero bs=1 seek=134217728 count=0 of=userapp0.bin

## Format Definition
Defined using [Kaitai](https://kaitai.io/) see [otra.ksy](./otra.ksy). You can use the [Kaitai IDE](https://ide.kaitai.io/) to fill in the blanks or explore files.

To renegerate the javascript bindings: 

    ksc --target javascript --outdir otra_reader otra.ksy

Replace 'javascript' with your language of choice supported by Kaitai and have fun.

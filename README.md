## Artosyn Firmware Tools

Tools to deal with Artosyn ARTO v4 firmware image files.

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

## Format Definition
Defined using [Kaitai](https://kaitai.io/) see [otra.ksc](./otra.ksc). You can use the [Kaitai IDE](https://ide.kaitai.io/) to fill in the blanks or explore files.

To renegerate the javascript bindings: 

    ksc --target javascript --outdir otra_reader otra.ksy

Replace 'javascript' with your language of choice supported by Kaitai and have fun.

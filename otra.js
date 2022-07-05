#!/usr/bin/env node
const fs = require("fs");
const path = require('node:path');

const Otra = require("./otra_reader/Otra");
const KaitaiStream = require('kaitai-struct/KaitaiStream');

const lzo = require('lzo');

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

yargs(hideBin(process.argv))
.command('extract <image> [folder]', 'extract the OTRA image', (yargs) => {
    return yargs
      .positional('image', {
        describe: 'image to process'
      })
      .positional('folder', {
        describe: 'folder to extract to'
      })
  }, (argv) => {
    const fileContent = fs.readFileSync(argv.image);
    const parsedOtra = new Otra(new KaitaiStream(fileContent));
    if(!argv.folder) {
        argv.folder = "./"+path.basename(argv.image).replace(/.img$/, '');
    }
    if(!fs.existsSync(argv.folder))
    fs.mkdirSync(argv.folder)
    console.log(`extracting image file: ${argv.image}`);

    function writeFile(file, data, decompressedSize) {
        console.log("writing: "+argv.folder+"/"+file)
        const buffer = Buffer.from(data)
        fs.writeFileSync(argv.folder+"/"+file, (decompressedSize && parsedOtra.header.compressed ? lzo.decompress(buffer, decompressedSize) : buffer))
    }
    writeFile("rom.bin", parsedOtra.rom)
    writeFile("loader.bin", parsedOtra.loader)
    writeFile("env.bin", parsedOtra.env)

    parsedOtra.segmentInfo0.forEach((segment, index) => {
        const partitions = parsedOtra.partInfo0.filter((part)=>{ return part.flashOffset === segment.flashOffset}).map((part) => { return part.name })
        const partition = partitions.length ? partitions.pop() : segment.flashOffset
        writeFile(partition+".bin", parsedOtra.segments0[index].body, segment.decompressedSize)
    })

  })
  .command('info <image>', 'show info on the OTRA image', (yargs) => {
    return yargs
      .positional('image', {
        describe: 'image to process'
      })
  }, (argv) => {
    const fileContent = fs.readFileSync(argv.image);
    const parsedOtra = new Otra(new KaitaiStream(fileContent));
    console.log(`image file: ${argv.image}

hash size:${parsedOtra.header.hashSize}
signature size:${parsedOtra.header.sigSize}

hash: ${Buffer.from(parsedOtra.header.hash).toString('hex')}
signature: ${Buffer.from(parsedOtra.header.signature).toString('hex')}


image size:${parsedOtra.header.imgSize}
rom size:${parsedOtra.header.romSize}
loader size:${parsedOtra.header.loaderSize}
env size:${parsedOtra.header.envSize}
version size:${parsedOtra.header.versionSize}

compressed:${parsedOtra.header.compressed}

partitions0 count:${parsedOtra.header.partitions0}
partitions1 count:${parsedOtra.header.partitions1}

segmenst0 count:${parsedOtra.header.segments0}
segments1 count:${parsedOtra.header.segments1}

partitions0:`);
    console.table(parsedOtra.partInfo0.map((part)=>{
        return {
            name: part.name,
            offset: part.flashOffset,
            size: humanFileSize(part.length),
            upgrade: Boolean(part.isUpgrade)
        }
    }))
    if(parsedOtra.header.partitions1) {
        console.log("partitions1:")
        console.table(parsedOtra.partInfo1.map((part)=>{
            return {
                name: part.name,
                offset: part.flashOffset,
                size: humanFileSize(part.length),
                upgrade: Boolean(part.isUpgrade)
            }
        }))
    }

    console.log("segments0:");
    console.table(parsedOtra.segmentInfo0.map((segment)=>{
        return {
            imgOffset: segment.imgOffset,
            flashOffset: segment.flashOffset,
            compressedSize: humanFileSize(segment.compressedSize),
            decompressedSize: humanFileSize(segment.decompressedSize),
            partition: parsedOtra.partInfo0.filter((part)=>{
                return part.flashOffset === segment.flashOffset
            }).map((part) => { return part.name }).pop() 
        }
    }))
    if(parsedOtra.header.segments1) {
        console.log("segments1:")
        console.table(parsedOtra.segmentInfo1.map((segment)=>{
            return {
                imgOffset: segment.imgOffset,
                flashOffset: segment.flashOffset,
                compressedSize: humanFileSize(segment.compressedSize),
                decompressedSize: humanFileSize(segment.decompressedSize),
                partition: parsedOtra.partInfo1.filter((part)=>{
                    part.flashOffset == segment.flashOffset
                }).map((part) => { return part.name })
            }
        }))
    }

  })
  .strictCommands()
  .demandCommand(1)
  .parse()





function humanFileSize(bytes, si=false, dp=1) {
    const thresh = si ? 1000 : 1024;
  
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
  
    const units = si 
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10**dp;
  
    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  
  
    return bytes.toFixed(dp) + ' ' + units[u];
  }
  
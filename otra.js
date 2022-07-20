#!/usr/bin/env node
const fs = require("fs");
const path = require('node:path');

const Otra = require("./otra_reader/Otra");
const KaitaiStream = require('kaitai-struct/KaitaiStream');

const lzo = require('lzo');

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers');
const { parse } = require("path");

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

    if(parsedOtra.header.headerVersion > 1) {
      parsedOtra.partInfo0 = mapPartsToSegments(parsedOtra.partInfo0, parsedOtra.segmentInfo0, parsedOtra.segments0);
      parsedOtra.partInfo1 = mapPartsToSegments(parsedOtra.partInfo1, parsedOtra.segmentInfo1, parsedOtra.segments1);
    }

    if(!argv.folder) {
        argv.folder = "./"+path.basename(argv.image).replace(/.img$/, '');
    }
    if(!fs.existsSync(argv.folder))
    fs.mkdirSync(argv.folder)
    console.log(`extracting image file: ${argv.image}`);

    function writeFile(file, data, decompressedSize, append) {
        console.log("writing: "+argv.folder+"/"+file + (append ? " +" : ""))
        const buffer = Buffer.from(data)
        fs.writeFileSync(argv.folder+"/"+file, (decompressedSize && parsedOtra.header.compressed ? lzo.decompress(buffer, decompressedSize) : buffer), 
        append ? {
          flag: "a+"
        } : null)
    }
    if(parsedOtra.header.romSize > 0) {
      writeFile("rom.img", parsedOtra.rom)
    }
    if(parsedOtra.header.loaderSize > 0) {
      writeFile("loader.img", parsedOtra.loader)
    }
    if(parsedOtra.header.envSize > 0) {
      writeFile("env.img", parsedOtra.env)
    }    

    function writePart(part) {
      part.segments.forEach((segment, index) => {
        writeFile(part.name+".img", segment.data.body, segment.decompressedSize, (index !== 0))
      })
    }

    if(parsedOtra.header.headerVersion > 1) {
      parsedOtra.partInfo0.forEach(writePart);
      parsedOtra.partInfo1.forEach(writePart);
    }

    

    /*parsedOtra.segmentInfo0.forEach((segment, index) => {
        const partitions = parsedOtra.partInfo0.filter((part)=>{ return part.flashOffset === segment.flashOffset}).map((part) => { return part.name })
        const partition = partitions.length ? partitions.pop() : segment.flashOffset
        writeFile(partition+".bin", parsedOtra.segments0[index].body, segment.decompressedSize)
    })
    */



  })
  .command('info <image>', 'show info on the OTRA image', (yargs) => {
    return yargs
      .positional('image', {
        describe: 'image to process'
      })
  }, (argv) => {
    const fileContent = fs.readFileSync(argv.image);
    const parsedOtra = new Otra(new KaitaiStream(fileContent));

    if(parsedOtra.header.headerVersion > 1) {
      parsedOtra.partInfo0 = mapPartsToSegments(parsedOtra.partInfo0, parsedOtra.segmentInfo0, parsedOtra.segments0);
      parsedOtra.partInfo1 = mapPartsToSegments(parsedOtra.partInfo1, parsedOtra.segmentInfo1, parsedOtra.segments1);
    }
    console.log(`image file: ${argv.image}
    
header version: ${parsedOtra.header.headerVersion}

hash size:${parsedOtra.header.hashSize}
signature size:${parsedOtra.header.sigSize}

hash: ${Buffer.from(parsedOtra.header.hash).toString('hex')}
signature: ${Buffer.from(parsedOtra.header.signature).toString('hex')}


image size:${parsedOtra.header.imgSize}
rom size:${parsedOtra.header.romSize}
loader size:${parsedOtra.header.loaderSize}
env size:${parsedOtra.header.envSize}
version size:${parsedOtra.header.headerVersionSize}
`);

if(parsedOtra.header.headerVersion > 3) {
  console.log(`sdk version: ${parsedOtra.headerExt.sdkVersion}`)
}

if(parsedOtra.header.headerVersion > 1) {
  console.log(`compressed:${parsedOtra.header.compressed}

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
              upgrade: Boolean(part.isUpgrade),
              segments: part.segments.length
          }
      }))
      if(parsedOtra.header.partitions1) {
          console.log("partitions1:")
          console.table(parsedOtra.partInfo1.map((part)=>{
              return {
                  name: part.name,
                  offset: part.flashOffset,
                  size: humanFileSize(part.length),
                  upgrade: Boolean(part.isUpgrade),
                  segments: part.segments.length

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
                  return segment.flashOffset >= part.flashOffset && segment.flashOffset < part.flashOffset + part.length
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
                    return segment.flashOffset >= part.flashOffset && segment.flashOffset < part.flashOffset + part.length
                  }).map((part) => { return part.name })
              }
          }))
      }
    }
  })
  .strictCommands()
  .demandCommand(1)
  .parse()


// i don't think this can be trivially done with kaitai but would be happy ot be proven wrong
function mapPartsToSegments(parts, segments, datas) {
  segments = segments.map((segment, index)=>{ return {...segment, data:datas[index]} })
  return parts.map((part)=>{ 
    return {
      ...part,
      segments: segments.filter((segment)=>{
        return segment.flashOffset >= part.flashOffset && segment.flashOffset < part.flashOffset + part.length
      })
    }
  })
}


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
  
#!/usr/bin/env node
const fs = require("fs");
const path = require('node:path');

const Otra = require("./otra_reader/Otra");
const OtraSpl = require("./otra_reader/OtraSpl");
const OtraSirius = require("./otra_reader/OtraSirius");
const KaitaiStream = require('kaitai-struct/KaitaiStream');

const lzo = require('lzo');

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers');
const { parse } = require("path");
const { parsed } = require("yargs");

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
    const type = getOtraType(fileContent);
    if(!argv.folder) {
      argv.folder = "./"+path.basename(argv.image).replace(/.img$/, '');
    }
    if(!fs.existsSync(argv.folder))
    fs.mkdirSync(argv.folder)
    
    if(type === "normal") {
      const parsedOtra = new Otra(new KaitaiStream(fileContent));

      if(parsedOtra.header.headerVersion > 1) {
        parsedOtra.partInfo0 = mapPartsToSegments(parsedOtra.partInfo0, parsedOtra.segmentInfo0, parsedOtra.segments0);
        parsedOtra.partInfo1 = mapPartsToSegments(parsedOtra.partInfo1, parsedOtra.segmentInfo1, parsedOtra.segments1);
      }
  
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
    }
    else if(type === "spl") {
      function writeFile(file, data) {
        console.log("writing: "+argv.folder+"/"+file)
        const buffer = Buffer.from(data)
        fs.writeFileSync(argv.folder+"/"+file, buffer);
      }
      const parsedOtra = new OtraSpl(new KaitaiStream(fileContent));
      if(parsedOtra.header.splLen > 0) {
        writeFile("spl.img", parsedOtra.spl);
      }
      if(parsedOtra.header.trootLen > 0) {
        writeFile("troot.img", parsedOtra.troot);
      }
      if(parsedOtra.header.signatureLen > 0) {
        writeFile("signature.img", parsedOtra.signature);
      }
    }
    else if(type === "sirius") {
      function writeFile(file, data) {
        console.log("writing: "+argv.folder+"/"+file)
        const buffer = Buffer.from(data)
        fs.writeFileSync(argv.folder+"/"+file, buffer);
      }
      const parsedOtra = new OtraSirius(new KaitaiStream(fileContent));
      if(parsedOtra.header.imgLen > 0) {
        writeFile("rom.img", parsedOtra.image);
      }
    }
    else {
      throw "Unknown image type";
    }

})
.command('info <image>', 'show info on the OTRA image', (yargs) => {
    return yargs
      .positional('image', {
        describe: 'image to process'
      })
  }, (argv) => {
    const fileContent = fs.readFileSync(argv.image);
    const type = getOtraType(fileContent);
    if(type === "normal") {
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
    }
    else if(type === "spl") {
      const parsedOtra = new OtraSpl(new KaitaiStream(fileContent));
      console.log(`spl image file: ${argv.image}

version: ${parsedOtra.header.version}
image type: ${parsedOtra.header.imgType}
checksum: 0x${parsedOtra.header.checksum.toString(16)}

spl load address: 0x${parsedOtra.header.splLoadAddr.toString(16)}
spl length: ${parsedOtra.header.splLen}

troot load address: 0x${parsedOtra.header.trootLoadAddr.toString(16)}
troot length: ${parsedOtra.header.trootLen}

signature load address: 0x${parsedOtra.header.signatureLoadAddr.toString(16)}
signature length: ${parsedOtra.header.signatureLen}
`);
      
    }
    else if(type === "sirius") {
      const parsedOtra = new OtraSirius(new KaitaiStream(fileContent));
      const ourCheck = checksum(parsedOtra.image);
      if(ourCheck !== parsedOtra.header.checksum) {
        console.log("checksum mismatch! "+ourCheck.toString(16)+"!=="+parsedOtra.header.checksum.toString(16))
      }
      console.log(`sirius image file: ${argv.image}

version: ${parsedOtra.header.version}
image type: ${parsedOtra.header.imgType}
checksum: 0x${parsedOtra.header.checksum.toString(16)}

hash length: ${parsedOtra.header.hashSize}
signature length: ${parsedOtra.header.sigLen}

hash: ${parsedOtra.hash.toString(16)}
signature: ${parsedOtra.sig.toString(16)}

load address: 0x${parsedOtra.header.imgLoadAddr.toString(16)}
length: ${parsedOtra.header.imgLen}
`);
    }
    else {
      throw "Unknown image type";
    }
  
})
.command('pack <type> <loadaddress> <input> <output>', 'pack a sirius OTRA image', (yargs) => {
  return yargs
    .positional('type', {
      describe: 'must be "sirius"'
    })
    .positional('loadaddress', {
      describe: 'image load address"'
    })
    .positional('input', {
      describe: 'input raw image'
    })
    .positional('output', {
      describe: 'output sirius OTRA image'
    })
}, (argv) => {
  if(argv.type !== "sirius") {
    throw "unsupported image type"
  }
  const image = fs.readFileSync(argv.input);
  const sum = checksum(image);
  const otra = Buffer.concat([Buffer.from("OTRA", "ascii"), Buffer.alloc(60), image])
  otra.writeUint32LE(parseInt(argv.loadaddress), 0xc);
  otra.writeUint32LE(image.length, 0x10);
  otra.writeUint32LE(sum, 0x20);
  fs.writeFileSync(argv.output, otra)
  
})
.strictCommands()
.demandCommand(1)
.parse()

function isZero(buf, start, len) {
  const target = buf.slice(start, start+len)
  for (var i = 0; i < len; i++) {
    if (target.readUInt8(i) !==0) {
        return false;
    }
  }
  return true;
}

function getOtraType(buf) {
  const magic = buf.toString("ascii", 0, 4);
  if(magic !== "OTRA") {
    return "unknown";
  }
  if(isZero(buf, 4, 8) && !isZero(buf, 36, 4) && isZero(buf, 40, 4*6)) {
    return "spl"
  }
  else if(isZero(buf, 4, 8) && !isZero(buf, 32, 4) && isZero(buf, 36, 4*7)) {
    return "sirius"
  }
  else {
    return "normal"
  }
}

// i don't think this can be trivially done with kaitai but would be happy to be proven wrong
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
  

function checksum(data) {
  //just sum up all the bytes
  const buf = Buffer.from(data);
  let result = 0;
    
  const len = buf.length;
  for (let i = 0; i < len; i++) {
    result += buf.readUInt8(i);
    result = result & 0xffffffff;
  }
  return result;
}
meta:
  id: otra_sirius
  file-extension: img
  endian: le
seq:
   - id: header
     type: header
   - id: hash
     size: header.hash_size
   - id: sig
     size: header.sig_len
   - id: image
     size: header.img_len
types:
  header:
    seq:
     - id: magic
       contents: "OTRA"
     - id: version
       type: u4
     - id: img_type
       type: u4
     - id: img_load_addr
       type: u4
     - id: img_len
       type: u4
     - id: algo
       type: u4
     - id: hash_size
       type: u4
     - id: sig_len
       type: u4
     - id: checksum
       type: u4
     - id: reserved
       size: 4*7
      
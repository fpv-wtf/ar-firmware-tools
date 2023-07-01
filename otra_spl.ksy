meta:
  id: otra_spl
  file-extension: img
  endian: le
seq:
   - id: header
     type: header
   - id: spl
     size: header.spl_len
   - id: troot
     size: header.troot_len
   - id: signature
     size: header.signature_len
     
types:
  header:
    seq:
     - id: magic
       contents: "OTRA"
     - id: version
       type: u4
     - id: img_type
       type: u4
     - id: spl_load_addr
       type: u4
     - id: spl_len
       type: u4
     - id: troot_load_addr
       type: u4
     - id: troot_len
       type: u4
     - id: signature_load_addr
       type: u4
     - id: signature_len
       type: u4
     - id: checksum
       type: u4
     - id: reserved
       size: 4*6
      
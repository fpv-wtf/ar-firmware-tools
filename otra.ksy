meta:
  id: otra
  file-extension: img
  endian: le
seq:
  - id: header
    type: header
  #tbd
  - id: unknown2
    size: 224
  - id: header_ext
    type: header_ext
  - id: rom
    size: header.rom_size
  - id: loader
    size: header.loader_size
  - id: env
    size: header.env_size
  - id: part_info0
    type: part_info
    repeat: expr
    repeat-expr: header.partitions0
  - id: part_info1
    type: part_info
    repeat: expr
    repeat-expr: header.partitions1
  - id: segment_info0
    type: segment_info
    repeat: expr
    repeat-expr: header.segments0
  - id: segment_info1
    type: segment_info
    repeat: expr
    repeat-expr: header.segments1
instances:
  segments0:
    type: file_body(segment_info0[_index].img_offset, segment_info0[_index].compressed_size)
    repeat: expr
    repeat-expr: header.segments0
  segments1:
    type: file_body(segment_info1[_index].img_offset, segment_info1[_index].compressed_size)
    repeat: expr
    repeat-expr: header.segments1
  #version:
  #  type: file_body(segment_info0[header.segments0-1].img_offset+segment_info0[header.segments0-1].compressed_size, 100)
types:
  header:
    seq:
      - id: magic
        contents: "OTRA"
      #bytes
      - id: hash_size
        type: u2
      #bits
      - id: sig_size
        type: u2
      - id: img_size
        type: u8
      - id: rom_size
        type: u4
      - id: loader_size
        type: u4
      - id: env_size
        type: u4
      - id: version_size
        type: u2
      - id: partitions0
        type: u2
      - id: compressed
        type: u2
      - id: segments0
        type: u2
      - id: partitions1
        type: u1
      - id: segments1
        type: u1
      - id: flash_type
        type: u1
      #we only try to handle version = 4
      #which is important for fields after this one
      - id: header_version
        type: u1
      - id: sig_realsize
        type: u2
      - id: object_version
        type: u4
      - id: depend_version
        type: u4
      - id: reserve
        size: 14
      - id: hash
        size: hash_size
      - id: signature
        size: sig_size
  header_ext:
    seq:
      - id: sdk_version
        type: str
        encoding: UTF-8
        terminator: 0
        size: 16
      - id: part_flag
        size: 16
     # - id: part_status
     #   type: u1
  part_info:
    seq:
      - id: name
        type: str
        encoding: UTF-8
        terminator: 0
        size: 32
      - id: flash_offset
        type: u8
      - id: length
        type: u8
      - id: is_upgrade
        type: u4
  segment_info:
    seq:
      - id: img_offset
        type: u8
      - id: flash_offset
        type: u8
      - id: compressed_size
        type: u8
      - id: decompressed_size
        type: u8
  file_body:
    params:
      - id: offset            
        type: u8
      - id: length             
        type: u8
    instances:
      body:
        pos: offset
        size: length
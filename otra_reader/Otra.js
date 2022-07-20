// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['kaitai-struct/KaitaiStream'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('kaitai-struct/KaitaiStream'));
  } else {
    root.Otra = factory(root.KaitaiStream);
  }
}(this, function (KaitaiStream) {
var Otra = (function() {
  function Otra(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Otra.prototype._read = function() {
    this.header = new Header(this._io, this, this._root);
    if (this.header.headerVersion > 3) {
      this.unknown2 = this._io.readBytes(224);
    }
    if (this.header.headerVersion > 3) {
      this.headerExt = new HeaderExt(this._io, this, this._root);
    }
    this.rom = this._io.readBytes(this.header.romSize);
    this.loader = this._io.readBytes(this.header.loaderSize);
    this.env = this._io.readBytes(this.header.envSize);
    if (this.header.headerVersion > 1) {
      this.partInfo0 = new Array(this.header.partitions0);
      for (var i = 0; i < this.header.partitions0; i++) {
        this.partInfo0[i] = new PartInfo(this._io, this, this._root);
      }
    }
    if (this.header.headerVersion > 1) {
      this.partInfo1 = new Array(this.header.partitions1);
      for (var i = 0; i < this.header.partitions1; i++) {
        this.partInfo1[i] = new PartInfo(this._io, this, this._root);
      }
    }
    if (this.header.headerVersion > 1) {
      this.segmentInfo0 = new Array(this.header.segments0);
      for (var i = 0; i < this.header.segments0; i++) {
        this.segmentInfo0[i] = new SegmentInfo(this._io, this, this._root);
      }
    }
    if (this.header.headerVersion > 1) {
      this.segmentInfo1 = new Array(this.header.segments1);
      for (var i = 0; i < this.header.segments1; i++) {
        this.segmentInfo1[i] = new SegmentInfo(this._io, this, this._root);
      }
    }
  }

  var PartInfo = Otra.PartInfo = (function() {
    function PartInfo(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    PartInfo.prototype._read = function() {
      this.name = KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(32), 0, false), "UTF-8");
      this.flashOffset = this._io.readU8le();
      this.length = this._io.readU8le();
      this.isUpgrade = this._io.readU4le();
    }

    return PartInfo;
  })();

  var Header = Otra.Header = (function() {
    function Header(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Header.prototype._read = function() {
      this.magic = this._io.readBytes(4);
      if (!((KaitaiStream.byteArrayCompare(this.magic, [79, 84, 82, 65]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([79, 84, 82, 65], this.magic, this._io, "/types/header/seq/0");
      }
      this.hashSize = this._io.readU2le();
      this.sigSize = this._io.readU2le();
      this.imgSize = this._io.readU8le();
      this.romSize = this._io.readU4le();
      this.loaderSize = this._io.readU4le();
      this.envSize = this._io.readU4le();
      this.versionSize = this._io.readU2le();
      this.partitions0 = this._io.readU2le();
      this.compressed = this._io.readU2le();
      this.segments0 = this._io.readU2le();
      this.partitions1 = this._io.readU1();
      this.segments1 = this._io.readU1();
      this.flashType = this._io.readU1();
      this.headerVersion = this._io.readU1();
      this.sigRealsize = this._io.readU2le();
      this.objectVersion = this._io.readU4le();
      this.dependVersion = this._io.readU4le();
      this.reserve = this._io.readBytes(14);
      this.hash = this._io.readBytes(this.hashSize);
      this.signature = this._io.readBytes(Math.floor(this.sigSize / 8));
    }

    return Header;
  })();

  var HeaderExt = Otra.HeaderExt = (function() {
    function HeaderExt(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    HeaderExt.prototype._read = function() {
      this.sdkVersion = KaitaiStream.bytesToStr(KaitaiStream.bytesTerminate(this._io.readBytes(16), 0, false), "UTF-8");
      this.partFlag = this._io.readBytes(16);
    }

    return HeaderExt;
  })();

  var FileBody = Otra.FileBody = (function() {
    function FileBody(_io, _parent, _root, offset, length) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;
      this.offset = offset;
      this.length = length;

      this._read();
    }
    FileBody.prototype._read = function() {
    }
    Object.defineProperty(FileBody.prototype, 'body', {
      get: function() {
        if (this._m_body !== undefined)
          return this._m_body;
        var _pos = this._io.pos;
        this._io.seek(this.offset);
        this._m_body = this._io.readBytes(this.length);
        this._io.seek(_pos);
        return this._m_body;
      }
    });

    return FileBody;
  })();

  var SegmentInfo = Otra.SegmentInfo = (function() {
    function SegmentInfo(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    SegmentInfo.prototype._read = function() {
      this.imgOffset = this._io.readU8le();
      this.flashOffset = this._io.readU8le();
      this.compressedSize = this._io.readU8le();
      this.decompressedSize = this._io.readU8le();
    }

    return SegmentInfo;
  })();
  Object.defineProperty(Otra.prototype, 'segments0', {
    get: function() {
      if (this._m_segments0 !== undefined)
        return this._m_segments0;
      if (this.header.headerVersion > 1) {
        this._m_segments0 = new Array(this.header.segments0);
        for (var i = 0; i < this.header.segments0; i++) {
          this._m_segments0[i] = new FileBody(this._io, this, this._root, this.segmentInfo0[i].imgOffset, this.segmentInfo0[i].compressedSize);
        }
      }
      return this._m_segments0;
    }
  });
  Object.defineProperty(Otra.prototype, 'segments1', {
    get: function() {
      if (this._m_segments1 !== undefined)
        return this._m_segments1;
      if (this.header.headerVersion > 1) {
        this._m_segments1 = new Array(this.header.segments1);
        for (var i = 0; i < this.header.segments1; i++) {
          this._m_segments1[i] = new FileBody(this._io, this, this._root, this.segmentInfo1[i].imgOffset, this.segmentInfo1[i].compressedSize);
        }
      }
      return this._m_segments1;
    }
  });

  return Otra;
})();
return Otra;
}));

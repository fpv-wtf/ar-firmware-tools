// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['kaitai-struct/KaitaiStream'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('kaitai-struct/KaitaiStream'));
  } else {
    root.OtraSirius = factory(root.KaitaiStream);
  }
}(this, function (KaitaiStream) {
var OtraSirius = (function() {
  function OtraSirius(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  OtraSirius.prototype._read = function() {
    this.header = new Header(this._io, this, this._root);
    this.hash = this._io.readBytes(this.header.hashSize);
    this.sig = this._io.readBytes(this.header.sigLen);
    this.image = this._io.readBytes(this.header.imgLen);
  }

  var Header = OtraSirius.Header = (function() {
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
      this.version = this._io.readU4le();
      this.imgType = this._io.readU4le();
      this.imgLoadAddr = this._io.readU4le();
      this.imgLen = this._io.readU4le();
      this.algo = this._io.readU4le();
      this.hashSize = this._io.readU4le();
      this.sigLen = this._io.readU4le();
      this.checksum = this._io.readU4le();
      this.reserved = this._io.readBytes((4 * 7));
    }

    return Header;
  })();

  return OtraSirius;
})();
return OtraSirius;
}));

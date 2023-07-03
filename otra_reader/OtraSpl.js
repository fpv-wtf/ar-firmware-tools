// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['kaitai-struct/KaitaiStream'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('kaitai-struct/KaitaiStream'));
  } else {
    root.OtraSpl = factory(root.KaitaiStream);
  }
}(this, function (KaitaiStream) {
var OtraSpl = (function() {
  function OtraSpl(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  OtraSpl.prototype._read = function() {
    this.header = new Header(this._io, this, this._root);
    this.spl = this._io.readBytes(this.header.splLen);
    this.troot = this._io.readBytes(this.header.trootLen);
    this.signature = this._io.readBytes(this.header.signatureLen);
  }

  var Header = OtraSpl.Header = (function() {
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
      this.splLoadAddr = this._io.readU4le();
      this.splLen = this._io.readU4le();
      this.trootLoadAddr = this._io.readU4le();
      this.trootLen = this._io.readU4le();
      this.signatureLoadAddr = this._io.readU4le();
      this.signatureLen = this._io.readU4le();
      this.checksum = this._io.readU4le();
      this.reserved = this._io.readBytes((4 * 6));
    }

    return Header;
  })();

  return OtraSpl;
})();
return OtraSpl;
}));

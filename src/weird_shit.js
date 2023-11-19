// https://profiler.firefox.com/from-browser/calltree/?globalTrackOrder=j0wi&hiddenGlobalTracks=1wh&hiddenLocalTracksByPid=39671-034~39674-0~39691-0~39678-0~39679-0&implementation=js&sourceView=https%3A%2F%2Fwww.crosserville.com%2Fjs%2Fbuilder%2FfillLib.js%3Fv%3D1697062583676&thread=s&v=10
const _0x533234 = function () {
  let _0x2fca82 = true;
  return function (_0x4272ab, _0x3e6f22) {
    const _0xace0be = _0x2fca82 ? function () {
      if (_0x3e6f22) {
        const _0x5d6938 = _0x3e6f22.apply(_0x4272ab, arguments);
        _0x3e6f22 = null;
        return _0x5d6938;
      }
    } : function () {};
    _0x2fca82 = false;
    return _0xace0be;
  };
}();
const _0x44e45f = _0x533234(this, function () {
  const _0x452010 = function () {
    let _0x26175e;
    try {
      _0x26175e = Function("return (function() {}.constructor(\"return this\")( ));")();
    } catch (_0x42bc72) {
      _0x26175e = window;
    }
    return _0x26175e;
  };
  const _0x57bcee = _0x452010();
  const _0x8564ed = _0x57bcee.console = _0x57bcee.console || {};
  const _0x12614a = ["log", "warn", "info", 'error', "exception", 'table', "trace"];
  for (let _0x52ea8b = 0x0; _0x52ea8b < _0x12614a.length; _0x52ea8b++) {
    const _0x1ef369 = _0x533234.constructor.prototype.bind(_0x533234);
    const _0x28bb68 = _0x12614a[_0x52ea8b];
    const _0x70d40b = _0x8564ed[_0x28bb68] || _0x1ef369;
    _0x1ef369.__proto__ = _0x533234.bind(_0x533234);
    _0x1ef369.toString = _0x70d40b.toString.bind(_0x70d40b);
    _0x8564ed[_0x28bb68] = _0x1ef369;
  }
});
_0x44e45f();
let grid;
let gridHash;
let slotList = [];
let slots;
let words;
let regionIsSeeded;
let regionSlots;
let cachedSingleCharOptions = {};
let cachedSlotOptions = {};
let cachedSlotColors = {};
const globalFilters = {
  'minScores': [],
  'excludeWords': {}
};
let orphanedSlotFilters;
let hasUnprocessedEdits;
let newFilterChange;
const dictionary = new Dictionary();
let isDictionaryInitializing;
let state;
let stopProcessing;
let postFillEvents;
let maxSlotOptions;
const Direction = Object.freeze({
  'ACROSS': 0x0,
  'DOWN': 0x1
});
const SlotFilterType = Object.freeze({
  'INCLUDE_LIST': 0x0,
  'EXCLUDE_LIST': 0x1
});
const Mode = Object.freeze({
  'FULL_SOLUTION': 0x0,
  'FIND_SLOT_OPTIONS': 0x1,
  'FIND_SINGLE_SLOT_OPTION': 0x2,
  'EVALUATE_SLOT_OPTIONS': 0x3
});
const ResumeAction = Object.freeze({
  'FIND_NEXT': 0x0,
  'BACKTRACK': 0x1,
  'END_SEARCH': 0x2
});
const Condition = Object.freeze({
  'SLOT_INFLUENCES': 0x0,
  'SLOT_IS_UNFILLED': 0x1
});
const FillAction = Object.freeze({
  'NEW_FILL_CHAR': 0x0,
  'FILTERED_CANDS': 0x1
});
const SearchPhase = Object.freeze({
  'GLOBAL': 0x0,
  'PER_CANDIDATE': 0x1
});
class Slot {
  static ["dictionary"];
  static ["excludeWords"];
  constructor(_0x16de9f, _0x15c2cd, _0x2eb28a, _0x26f89f, _0x508760, _0x106287) {
    this.desc = '' + _0x26f89f + (_0x106287 === Direction.ACROSS ? 'A' : 'D');
    this.index = _0x16de9f;
    this.startPos = _0x15c2cd;
    this.slotPos = _0x2eb28a;
    this.wordNum = _0x26f89f;
    this.length = _0x508760;
    this.dir = _0x106287;
    this.chars = new Array(_0x508760);
    this.crossers = new Array(_0x508760);
    this.isUnchecked = false;
    this.candidateStack = [];
    const _0x5f1145 = new Array(_0x508760);
    for (let _0x49159e = 0x0; _0x49159e < _0x508760; _0x49159e++) {
      _0x5f1145[_0x49159e] = _0x49159e;
    }
    this.fillCharStack = [{
      'chars': new Array(_0x508760),
      'blankIndexes': _0x5f1145
    }];
  }
  ["addChar"](_0x408dae, _0x2bda4e) {
    this.chars[_0x408dae] = _0x2bda4e;
    this.fillCharStack[0x0].blankIndexes = this.fillCharStack[0x0].blankIndexes.filter(_0x1075cd => _0x1075cd !== _0x408dae);
    if (_0x2bda4e.length > 0x1) {
      this.hasRebus = true;
      this.computeCharOffsets();
    }
  }
  ["removeChar"](_0x1ae5ac) {
    const _0x59841d = this.chars[_0x1ae5ac] && this.chars[_0x1ae5ac].length > 0x1;
    this.chars[_0x1ae5ac] = undefined;
    this.fillCharStack[0x0].blankIndexes.push(_0x1ae5ac);
    if (_0x59841d) {
      this.hasRebus = this.chars.some(_0x101c3c => _0x101c3c && _0x101c3c.length > 0x1);
      if (this.hasRebus) {
        this.computeCharOffsets();
      }
    }
  }
  ["computeCharOffsets"]() {
    this.charOffsets = new Array(this.length);
    this.charLens = new Array(this.length);
    let _0xf6cd62 = 0x0;
    for (let _0x2eb618 = 0x0; _0x2eb618 < this.length; _0x2eb618++) {
      this.charOffsets[_0x2eb618] = _0xf6cd62;
      this.charLens[_0x2eb618] = this.chars[_0x2eb618] ? this.chars[_0x2eb618].length : 0x1;
      _0xf6cd62 += this.charLens[_0x2eb618];
    }
  }
  ["getChar"](_0x38f421, _0x1e53a9) {
    if (!this.hasRebus) {
      return _0x38f421[_0x1e53a9];
    } else {
      return _0x38f421.substring(this.charOffsets[_0x1e53a9], this.charOffsets[_0x1e53a9] + this.charLens[_0x1e53a9]);
    }
  }
  ["matches"](_0x4c9c83, _0x38de2a, _0x498e25) {
    if (this.dir !== _0x4c9c83 || this.slotPos !== _0x38de2a) {
      return false;
    }
    return _0x498e25 >= this.startPos && _0x498e25 < this.startPos + this.length;
  }
  ["getCurrentCandidates"]() {
    if (this.candidateStack.length === 0x0) {
      return null;
    }
    return this.candidateStack[this.candidateStack.length - 0x1];
  }
  ["getCurrentCharOptions"]() {
    if (this.candidateStack.length === 0x0) {
      return null;
    }
    return this.candidateStack[this.candidateStack.length - 0x1].charOptions;
  }
  ['getFillChar'](_0x48f109) {
    for (let _0x42bd67 = this.fillCharStack.length - 0x1; _0x42bd67 > 0x0; _0x42bd67--) {
      const _0x45351e = this.fillCharStack[_0x42bd67].chars[_0x48f109];
      if (_0x45351e !== undefined) {
        return _0x45351e;
      }
    }
    return undefined;
  }
  ["getCrosserCandidates"](_0xea8ab7) {
    let _0x55f465;
    _0x393132: for (let _0x4fa862 = 0x0; _0x4fa862 < this.length; _0x4fa862++) {
      if (this.chars[_0x4fa862] || this.getFillChar(_0x4fa862) !== undefined) {
        continue;
      }
      const _0x3810cd = this.getChar(_0xea8ab7, _0x4fa862);
      const _0x3d27b8 = this.crossers[_0x4fa862];
      if (!_0x3d27b8) {
        continue;
      }
      const _0x478f1b = this.slotPos - _0x3d27b8.startPos;
      const _0x56a692 = new Array(_0x3d27b8.length);
      for (let _0x56ef6f = 0x0; _0x56ef6f < _0x3d27b8.length; _0x56ef6f++) {
        if (_0x56ef6f === _0x478f1b) {
          _0x56a692.push(_0x3810cd);
        } else {
          const _0x3bb108 = _0x3d27b8.chars[_0x56ef6f] || _0x3d27b8.getFillChar(_0x56ef6f);
          if (!_0x3bb108) {
            continue _0x393132;
          }
          _0x56a692.push(_0x3bb108);
        }
      }
      _0x55f465 = _0x55f465 || [];
      _0x55f465.push({
        'slot': _0x3d27b8,
        'w': _0x56a692.join('')
      });
    }
    return _0x55f465;
  }
  ["performInitialLookup"](_0x58fb6e, _0x3cbded) {
    const _0x78c30c = this.filter && this.filter.wordFilter && this.filter.wordFilter.enabled ? this.filter.wordFilter : null;
    if (_0x78c30c && _0x78c30c.type === SlotFilterType.INCLUDE_LIST && _0x78c30c.list.length > 0x0) {
      const _0x158181 = [];
      _0x78c30c.list.forEach(_0x1334bf => {
        if (!Slot.dictionary.excludeWords.has(_0x1334bf.w)) {
          let _0x1460dd = true;
          for (let _0x45f314 = 0x0; _0x45f314 < _0x58fb6e.length; _0x45f314++) {
            if (_0x58fb6e[_0x45f314] && _0x58fb6e[_0x45f314] !== this.getChar(_0x1334bf.w, _0x45f314)) {
              _0x1460dd = false;
              break;
            }
          }
          if (_0x1460dd) {
            _0x158181.push(_0x1334bf);
          }
        }
      });
      this.candidateStack.push(_0x158181);
    } else {
      const _0x12cb03 = this.filter && this.filter.minScore;
      if (_0x58fb6e.every(_0x33c49a => _0x33c49a === undefined)) {
        _0x58fb6e = [Dictionary.validChars];
      }
      const _0x129f88 = this.filter && this.filter.altWordList;
      const _0x5b236c = _0x129f88 ? Slot.dictionary.altWordListIndexes[_0x129f88] : Slot.dictionary.index;
      let _0x22895e = this.length;
      if (this.hasRebus) {
        const _0x2bda7e = new Array(this.charOffsets[this.length - 0x1] + this.charLens[this.length - 0x1]);
        let _0x138960 = 0x0;
        let _0x381c72;
        for (let _0x155b0e = 0x0; _0x155b0e < this.length; _0x155b0e++) {
          if (this.charLens[_0x155b0e] === 0x1) {
            _0x2bda7e[_0x138960++] = _0x58fb6e[_0x155b0e];
          } else {
            for (let _0xcd101a = 0x0; _0xcd101a < this.charLens[_0x155b0e]; _0xcd101a++) {
              _0x381c72 = _0x58fb6e[_0x155b0e].charCodeAt(_0xcd101a);
              if (_0x381c72 < 0x30 || _0x381c72 > 0x39 && _0x381c72 < 0x41 || _0x381c72 > 0x5a) {
                this.candidateStack.push([]);
                return;
              }
              _0x2bda7e[_0x138960++] = _0x58fb6e[_0x155b0e][_0xcd101a];
            }
          }
        }
        _0x58fb6e = _0x2bda7e;
        _0x22895e = _0x2bda7e.length;
      }
      let _0x17cfdf = Slot.dictionary.lookup({
        'wordIndex': _0x5b236c,
        'length': _0x22895e,
        'chars': _0x58fb6e,
        'minScore': _0x12cb03,
        'capResults': _0x3cbded
      });
      if (!_0x17cfdf) {
        return;
      }
      if (this.invalidOptions) {
        _0x17cfdf = _0x17cfdf.filter(_0x38e0a0 => !this.invalidOptions.has(_0x38e0a0));
      }
      const _0x620089 = Slot.excludeWords[this.length];
      if (_0x620089 && _0x620089.length > 0x0) {
        _0x17cfdf = _0x17cfdf.filter(_0x81a10c => !_0x620089.has(_0x81a10c.w));
      }
      if (_0x78c30c && _0x78c30c.type === SlotFilterType.EXCLUDE_LIST) {
        _0x17cfdf = _0x17cfdf.filter(_0x9c57d4 => !_0x78c30c.list.find(_0x4874d9 => _0x4874d9.w === _0x9c57d4.w));
      }
      this.candidateStack.push(_0x17cfdf);
    }
  }
  ["findCurrentCharOptions"]() {
    const _0xdd420f = this.fillCharStack[this.fillCharStack.length - 0x1].blankIndexes;
    const _0x32a1fa = new Array(this.length);
    for (let _0x5453c5 = 0x0; _0x5453c5 < _0xdd420f.length; _0x5453c5++) {
      _0x32a1fa[_0xdd420f[_0x5453c5]] = new Array(0x24);
    }
    const _0x22dff9 = this.getCurrentCandidates();
    _0x22dff9.forEach(_0x454435 => {
      for (let _0x9f68d = 0x0; _0x9f68d < _0xdd420f.length; _0x9f68d++) {
        const _0x4d96e1 = this.getChar(_0x454435.w, _0xdd420f[_0x9f68d]);
        _0x32a1fa[_0xdd420f[_0x9f68d]][Dictionary.getCharCode(_0x4d96e1)] = true;
      }
    });
    _0x22dff9.charOptions = _0x32a1fa;
  }
  ["applyNewCharOptions"](_0x551b3a) {
    this.baseCandidates = [];
    this.invalidOptions = this.invalidOptions || new HybridList();
    this.candidateStack[0x0].forEach(_0x48638f => {
      for (let _0x138a42 = 0x0; _0x138a42 < _0x551b3a.length; _0x138a42++) {
        if (!_0x551b3a[_0x138a42]) {
          continue;
        }
        if (!_0x551b3a[_0x138a42][Dictionary.getCharCode(this.getChar(_0x48638f.w, _0x138a42))]) {
          this.invalidOptions.add(_0x48638f);
          return;
        }
      }
      this.baseCandidates.push(_0x48638f);
    });
    this.candidateStack[0x0] = this.baseCandidates;
    this.findCurrentCharOptions();
  }
  ['pushFillCandidate'](_0x268908) {
    const _0x4dcb50 = new Array(this.length);
    for (let _0x14d1ca = 0x0; _0x14d1ca < this.length; _0x14d1ca++) {
      if (this.chars[_0x14d1ca]) {
        _0x4dcb50[_0x14d1ca] = undefined;
        continue;
      }
      const _0xd0226b = this.getFillChar(_0x14d1ca);
      _0x4dcb50[_0x14d1ca] = _0xd0226b !== undefined ? undefined : this.getChar(_0x268908.w, _0x14d1ca);
    }
    const _0x4d1c6c = {
      'chars': _0x4dcb50,
      'dictEntry': _0x268908
    };
    this.fillCharStack.push(_0x4d1c6c);
    return _0x4d1c6c;
  }
  ["pushFillChar"](_0x4b9775, _0x2deca0) {
    const _0x503ce8 = _0x2deca0 - this.startPos;
    const _0x2a48cc = {
      'chars': new Array(this.length),
      'index': _0x503ce8
    };
    _0x2a48cc.chars[_0x503ce8] = _0x4b9775;
    const _0x3b8a32 = this.fillCharStack[this.fillCharStack.length - 0x1].blankIndexes;
    _0x2a48cc.blankIndexes = _0x3b8a32.filter(_0x258b2b => _0x258b2b !== _0x503ce8);
    this.fillCharStack.push(_0x2a48cc);
    if (this.length <= 0x2) {
      return;
    }
    if (this.candidateStack.length === 0x0) {
      this.performInitialLookup(_0x2a48cc.chars);
    } else {
      const _0x5e8043 = this.candidateStack[this.candidateStack.length - 0x1];
      const _0x5108e3 = _0x5e8043.filter(_0xa5898c => this.getChar(_0xa5898c.w, _0x503ce8) === _0x4b9775);
      if (_0x5108e3.length === 0x1) {
        _0x2a48cc.dictEntry = _0x5108e3[0x0];
      }
      this.candidateStack.push(_0x5108e3);
    }
    this.findCurrentCharOptions();
    return _0x2a48cc;
  }
  ["popFillChar"]() {
    this.fillCharStack.pop();
    if (this.length <= 0x2) {
      return;
    }
    this.candidateStack.pop();
  }
  ["getGridCoords"](_0x138ddb) {
    if (this.dir === Direction.ACROSS) {
      return {
        'irow': this.slotPos,
        'icol': this.startPos + _0x138ddb
      };
    } else {
      if (this.dir === Direction.DOWN) {
        return {
          'irow': this.startPos + _0x138ddb,
          'icol': this.slotPos
        };
      }
    }
  }
  ["getSlotOptions"](_0x109d66) {
    if (_0x109d66) {
      if (this.validOptions) {
        return this.validOptions;
      }
      if (this.staleOptions) {
        let _0x49c5d5 = this.staleOptions;
        const _0x26bb84 = this.filter && this.filter.wordFilter;
        if (_0x26bb84 && _0x26bb84.type === SlotFilterType.EXCLUDE_LIST) {
          _0x49c5d5 = _0x49c5d5.filter(_0x20e314 => !_0x26bb84.list.find(_0x393615 => _0x393615.w === _0x20e314.entry.w));
        } else if (_0x26bb84 && _0x26bb84.type === SlotFilterType.INCLUDE_LIST) {
          _0x49c5d5 = _0x49c5d5.filter(_0x4c01c2 => _0x26bb84.list.find(_0x29c1c4 => _0x29c1c4.w === _0x4c01c2.entry.w));
        }
        return _0x49c5d5;
      }
    }
    return this.baseCandidates;
  }
  get ["numConstraints"]() {
    return this.chars.reduce((_0x8fff2a, _0xe04703) => _0x8fff2a + (_0xe04703 ? 0x1 : 0x0), 0x0);
  }
  get ["hasBlanks"]() {
    for (let _0x3d24b2 = 0x0; _0x3d24b2 < this.chars.length; _0x3d24b2++) {
      if (!this.chars[_0x3d24b2]) {
        return true;
      }
    }
    return false;
  }
  get ["isFilled"]() {
    if (this.parentSubregions && this.parentSubregions.some(_0x3f6bde => _0x3f6bde.isFilled)) {
      return true;
    }
    for (let _0x34e34f = 0x0; _0x34e34f < this.length; _0x34e34f++) {
      if (!this.chars[_0x34e34f] && this.getFillChar(_0x34e34f) === undefined) {
        return false;
      }
    }
    return true;
  }
  get ["isAllBlank"]() {
    return this.chars.every(_0x522fa1 => _0x522fa1 === undefined);
  }
  get ["numCandidates"]() {
    if (this.candidateStack.length === 0x0) {
      return Slot.dictionary.numWordsByLength[this.length] + 0x1 || 0x0;
    }
    return this.candidateStack[this.candidateStack.length - 0x1].length;
  }
  get ["counts"]() {
    const _0x12156c = this.baseCandidates ? this.baseCandidates.length : Slot.dictionary.numWordsByLength[this.length] + 0x1 || 0x0;
    const _0x292655 = this.validOptions || this.staleOptions;
    const _0x4876ab = _0x292655 ? _0x292655.length : 0x0;
    const _0x597bb = this.invalidOptions ? this.invalidOptions.length : 0x0;
    return {
      'candidates': _0x12156c,
      'validOptions': _0x4876ab,
      'invalidOptions': _0x597bb
    };
  }
  get ["hasFilter"]() {
    return this.filter && (this.filter.minScore || this.filter.wordFilter || this.filter.altWordList);
  }
  get ["hasIncludeWordFilter"]() {
    return this.filter && this.filter.wordFilter && this.filter.wordFilter.enabled && this.filter.wordFilter.type === SlotFilterType.INCLUDE_LIST && this.filter.wordFilter.list.length > 0x0;
  }
  get ["hasMinScoreFilter"]() {
    return this.filter && this.filter.minScore > 0x0;
  }
  get ["hasAltWordList"]() {
    return this.filter && this.filter.altWordList;
  }
  get ['name']() {
    return Slot.formatName(this.wordNum, this.dir);
  }
  get ["word"]() {
    const _0x3b13f6 = new Array(this.length);
    for (let _0x2d2497 = 0x0; _0x2d2497 < this.length; _0x2d2497++) {
      if (this.chars[_0x2d2497] !== undefined) {
        _0x3b13f6.push(this.chars[_0x2d2497]);
      } else {
        const _0x471c52 = this.getFillChar(_0x2d2497);
        if (_0x471c52) {
          _0x3b13f6.push(_0x471c52);
        } else {
          _0x3b13f6.push('.');
        }
      }
    }
    return _0x3b13f6.join('');
  }
  get ["wordInfo"]() {
    if (!this.hasBlanks) {
      return {
        'num': this.wordNum,
        'dir': this.dir,
        'w': this.word,
        'isFill': false
      };
    }
    const _0x40fdf1 = this.entry;
    if (_0x40fdf1) {
      const _0x545e15 = {
        'num': this.wordNum,
        'dir': this.dir,
        'w': _0x40fdf1.w,
        's': _0x40fdf1.s,
        'isFill': true
      };
      if (this.entry.c) {
        _0x545e15.c = this.entry.c;
      }
      if (this.filter && this.filter.altWordList) {
        _0x545e15.isAltWordListSlot = true;
      }
      return _0x545e15;
    }
    throw Error("Invalid wordInfo request for " + this.name);
  }
  get ["entry"]() {
    return this.fillCharStack[this.fillCharStack.length - 0x1].dictEntry;
  }
  get ["location"]() {
    return {
      'name': this.name,
      'dir': this.dir,
      'startPos': this.startPos,
      'slotPos': this.slotPos,
      'length': this.length
    };
  }
  static ["formatName"](_0x2f0236, _0x498f43) {
    return '' + _0x2f0236 + (_0x498f43 === Direction.ACROSS ? 'A' : 'D');
  }
}
class HybridList {
  #useArray;
  #array;
  #set;
  constructor() {
    this.#useArray = true;
    this.#array = [];
  }
  ["add"](_0x3b95b9) {
    if (this.#useArray && this.#array.length >= HybridList.threshold) {
      this.#set = new Set();
      this.#array.forEach(_0x2eec68 => this.#set.add(_0x2eec68));
      this.#useArray = false;
    }
    if (this.#useArray) {
      if (!this.#array.includes(_0x3b95b9)) {
        this.#array.push(_0x3b95b9);
      }
    } else {
      this.#set.add(_0x3b95b9);
    }
  }
  ["delete"](_0x2f6768) {
    if (this.#useArray) {
      const _0x307eed = this.#array.indexOf(_0x2f6768);
      if (_0x307eed !== -0x1) {
        this.#array.splice(_0x307eed, 0x1);
      }
    } else {
      this.#set['delete'](_0x2f6768);
      this.#array = null;
    }
  }
  ['clear']() {
    this.#useArray = true;
    this.#array = [];
  }
  ["has"](_0x2708a5) {
    return this.#useArray ? this.#array.includes(_0x2708a5) : this.#set.has(_0x2708a5);
  }
  ["clone"]() {
    const _0x4cc2cc = new HybridList();
    _0x4cc2cc.#useArray = this.#useArray;
    _0x4cc2cc.#array = this.#array.slice();
    if (this.#set) {
      _0x4cc2cc.#set = new Set(this.#set);
    }
    return _0x4cc2cc;
  }
  get ["items"]() {
    if (this.#useArray) {
      return this.#array;
    }
    if (this.#array && this.#array.length === this.#set.size) {
      return this.#array;
    }
    return this.#array = Array.from(this.#set.values());
  }
  get ["length"]() {
    return this.#useArray ? this.#array.length : this.#set.size;
  }
  static ["threshold"] = 0x32;
}
class Queue {
  ["arrays"];
  ['head'];
  ["tail"];
  static ["initSize"] = 0x12c;
  constructor() {
    this.arrays = [new Array(Queue.initSize)];
    this.head = this.tail = 0x0;
  }
  ["enqueue"](_0x34c460) {
    if (this.tail === this.arrays.length * Queue.initSize) {
      this.arrays.push(Array(Queue.initSize));
    }
    this.arrays[Math.floor(this.tail / Queue.initSize)][this.tail % Queue.initSize] = _0x34c460;
    this.tail++;
  }
  ["dequeue"]() {
    if (this.head === this.tail) {
      return null;
    }
    const _0x23c20a = Math.floor(this.head / Queue.initSize);
    const _0x21aaaa = this.head % Queue.initSize;
    const _0x392bcf = this.arrays[_0x23c20a][_0x21aaaa];
    this.arrays[_0x23c20a][_0x21aaaa] = undefined;
    if (++this.head === this.tail) {
      this.head = this.tail = 0x0;
      if (this.arrays.length > 0x1) {
        this.arrays.splice(0x1);
      }
    } else if (this.head >= Queue.initSize) {
      this.arrays.splice(0x0, 0x1);
      this.head -= Queue.initSize;
      this.tail -= Queue.initSize;
    }
    return _0x392bcf;
  }
  ["clear"]() {
    this.head = this.tail = 0x0;
  }
  ["size"]() {
    return this.tail - this.head;
  }
}
async function initializeDictionary(_0x4d02cb) {
  if (isDictionaryInitializing || _0x4d02cb === 0x2 && !dictionary.isInitialized) {
    await dictionaryInitialized();
  }
  if (_0x4d02cb === 0x2) {
    let _0x26aae6;
    if (globalFilters.minScores.length !== dictionary.minScores.length) {
      _0x26aae6 = true;
    } else {
      for (let _0x5e19e9 = 0x0; _0x5e19e9 < globalFilters.minScores.length; _0x5e19e9++) {
        if (!dictionary.minScores.some(_0x32a348 => _0x32a348.wordLength === globalFilters.minScores[_0x5e19e9].wordLength && _0x32a348.minScore === globalFilters.minScores[_0x5e19e9].minScore)) {
          _0x26aae6 = true;
          break;
        }
      }
    }
    if (!_0x26aae6) {
      return false;
    }
  }
  try {
    isDictionaryInitializing = true;
    try {
      while (fillOpInProgress()) {
        await terminate();
      }
      await dictionary.initializeIndex(globalFilters.minScores, includeClues);
      if (_0x4d02cb === 0x0) {
        await dictionary.initializeAltWordListIndexes();
      }
      dictionary.isInitialized = true;
    } catch (_0x37d9c3) {
      const _0x3f91d4 = _0x37d9c3.name === "InvalidStateError" && /Firefox\/[\d.]+$/.test(navigator.userAgent);
      if (postFillEvents) {
        postMessage({
          'type': "fillEvent",
          'name': "dictionaryLoadFailed",
          'indexedDBErr': _0x3f91d4
        });
      }
      return false;
    }
    if (slots && _0x4d02cb === 0x1) {
      if (fillOpInProgress()) {
        reportError('fillLib.initializeDictionary', Error("Fill Op started during dictionary reinitialization"), null, true);
        await terminate();
      }
      clearFillCandidates(true);
      slotList.forEach(_0x556cb4 => delete _0x556cb4.staleOptions);
      newFilterChange = {
        'isConstraining': false
      };
      performInitialLookups();
    }
    return true;
  } finally {
    isDictionaryInitializing = false;
    if (dictionary.isInitialized) {
      const _0x1f1823 = new Event('dictionaryInitialized');
      self.dispatchEvent(_0x1f1823);
    }
  }
}
function dictionaryInitialized() {
  return new Promise(_0x170892 => {
    if (dictionary.isInitialized && !isDictionaryInitializing) {
      return _0x170892(true);
    }
    self.addEventListener("dictionaryInitialized", _0x170892, {
      'once': true
    });
  });
}
function processUpdatedGrid(_0x299078) {
  try {
    const _0x497220 = _0x299078 ? slotList.filter(_0x3f9e84 => _0x3f9e84.filter) : null;
    if (!_0x299078) {
      orphanedSlotFilters = null;
    }
    initializeSlots();
    gridHash = getCurrentGridHash();
    let _0x460760;
    if (_0x497220) {
      _0x497220.forEach(_0x8b038c => {
        const _0x5b8653 = slotList.find(_0x211d01 => _0x211d01.startPos === _0x8b038c.startPos && _0x211d01.slotPos === _0x8b038c.slotPos && _0x211d01.length === _0x8b038c.length && _0x211d01.dir === _0x8b038c.dir);
        if (_0x5b8653) {
          _0x5b8653.filter = _0x8b038c.filter;
        } else {
          _0x460760 = _0x460760 || [];
          _0x460760.push({
            'startPos': _0x8b038c.startPos,
            'slotPos': _0x8b038c.slotPos,
            'length': _0x8b038c.length,
            'dir': _0x8b038c.dir,
            'filter': _0x8b038c.filter
          });
        }
      });
    }
    if (_0x299078) {
      if (orphanedSlotFilters) {
        const _0x3825c7 = [];
        orphanedSlotFilters.forEach(_0x5d926f => {
          const _0x591685 = slotList.find(_0x40ec69 => _0x40ec69.startPos === _0x5d926f.startPos && _0x40ec69.slotPos === _0x5d926f.slotPos && _0x40ec69.length === _0x5d926f.length && _0x40ec69.dir === _0x5d926f.dir);
          if (_0x591685) {
            if (!_0x591685.filter) {
              _0x591685.filter = _0x5d926f.filter;
            }
            _0x3825c7.push(_0x5d926f);
          }
        });
        if (_0x3825c7.length > 0x0) {
          orphanedSlotFilters = orphanedSlotFilters.filter(_0x50dbb0 => !_0x3825c7.includes(_0x50dbb0));
        }
        if (_0x460760) {
          orphanedSlotFilters.push(..._0x460760);
        }
      } else {
        orphanedSlotFilters = _0x460760;
      }
    }
    hasUnprocessedEdits = true;
    if (dictionary.isInitialized) {
      performInitialLookups();
    }
    determinePuzzleRegions();
  } catch (_0x40d8a6) {
    reportError("fillClient.processUpdatedGrid", _0x40d8a6, null, true);
  }
}
function hasGlobalFilters() {
  return globalFilters.minScores.length !== 0x0 || Object.keys(globalFilters.excludeWords).length !== 0x0;
}
function clearGlobalFilters() {
  globalFilters.minScores = [];
  Slot.excludeWords = globalFilters.excludeWords = {};
}
const characterEdits = [];
let charEditsTimeoutId;
let charEditsBeingProcessed;
async function addCharEditEvent(_0x5354a8) {
  characterEdits.push(_0x5354a8);
  if (!charEditsBeingProcessed) {
    if (charEditsTimeoutId) {
      clearTimeout(charEditsTimeoutId);
    }
    charEditsTimeoutId = setTimeout(processCharEdits, 0x1f4);
  }
}
function initiateEditProcessing() {
  if (!charEditsBeingProcessed) {
    if (charEditsTimeoutId) {
      clearTimeout(charEditsTimeoutId);
    }
    processCharEdits();
  }
}
async function processCharEdits() {
  let _0x5cdc22;
  try {
    charEditsBeingProcessed = true;
    charEditsTimeoutId = null;
    hasUnprocessedEdits = true;
    while (fillOpInProgress()) {
      await terminate();
    }
    slotList.forEach(_0x21766e => {
      if (_0x21766e.validOptions) {
        _0x21766e.staleOptions = _0x21766e.validOptions;
      }
    });
    const _0xc2bb56 = new Array(slotList.length);
    slotList.forEach(_0x160f8a => {
      if (_0x160f8a.validOptions) {
        _0xc2bb56[_0x160f8a.index] = {
          'validOptions': _0x160f8a.validOptions.slice(),
          'invalidOptions': _0x160f8a.invalidOptions && _0x160f8a.invalidOptions.clone(),
          'foundAllOptions': _0x160f8a.foundAllOptions,
          'baseCandidates': _0x160f8a.baseCandidates && _0x160f8a.baseCandidates.slice()
        };
      }
    });
    cachedSlotOptions[gridHash] = _0xc2bb56;
    const _0x160ca0 = new Array(slotList.length);
    let _0x371d2c = true;
    while ((_0x5cdc22 = characterEdits.shift()) !== undefined) {
      if (_0x5cdc22.type === "addedChar" && _0x5cdc22.data.char === null) {
        reportError("fillLib.processCharEdits", Error("Got null character edit"), {
          'charEdit': _0x5cdc22,
          'characterEdits': characterEdits
        }, true);
        continue;
      }
      if (_0x5cdc22.type === "addedChar") {
        if (grid.gridChars[_0x5cdc22.data.rowNum][_0x5cdc22.data.colNum].char) {
          _0x371d2c = false;
        }
        grid.gridChars[_0x5cdc22.data.rowNum][_0x5cdc22.data.colNum].char = _0x5cdc22.data.char;
      } else {
        _0x371d2c = false;
        grid.gridChars[_0x5cdc22.data.rowNum][_0x5cdc22.data.colNum].char = undefined;
      }
      const _0x38641d = slotList.find(_0x3df574 => _0x3df574.matches(Direction.ACROSS, _0x5cdc22.data.rowNum, _0x5cdc22.data.colNum));
      if (_0x38641d) {
        const _0x5f33c3 = _0x5cdc22.data.colNum - _0x38641d.startPos;
        _0x160ca0[_0x38641d.index] = true;
        if (_0x5cdc22.type === "addedChar") {
          _0x38641d.addChar(_0x5f33c3, _0x5cdc22.data.char);
        } else {
          _0x38641d.removeChar(_0x5f33c3);
        }
        if (_0x38641d.isFilled) {
          if (!_0x38641d.validOptions || !_0x38641d.validOptions.find(_0x5d73dc => _0x5d73dc.entry.w === _0x38641d.word)) {
            _0x371d2c = false;
          }
        }
      }
      const _0x55f5c3 = slotList.find(_0x5eb022 => _0x5eb022.matches(Direction.DOWN, _0x5cdc22.data.colNum, _0x5cdc22.data.rowNum));
      if (_0x55f5c3) {
        const _0x2f97e4 = _0x5cdc22.data.rowNum - _0x55f5c3.startPos;
        _0x160ca0[_0x55f5c3.index] = true;
        if (_0x5cdc22.type === 'addedChar') {
          _0x55f5c3.addChar(_0x2f97e4, _0x5cdc22.data.char);
        } else {
          _0x55f5c3.removeChar(_0x2f97e4);
        }
        if (_0x55f5c3.isFilled) {
          if (!_0x55f5c3.validOptions || !_0x55f5c3.validOptions.find(_0x2df37d => _0x2df37d.entry.w === _0x55f5c3.word)) {
            _0x371d2c = false;
          }
        }
      }
    }
    gridHash = getCurrentGridHash();
    initializeGridWords("charEdit");
    hasUnprocessedEdits = true;
    clearFillCandidates({
      'isConstraining': _0x371d2c
    });
    if (_0x371d2c) {
      for (let _0x55ae83 = 0x0; _0x55ae83 < _0x160ca0.length; _0x55ae83++) {
        if (_0x160ca0[_0x55ae83]) {
          delete slotList[_0x55ae83].invalidOptions;
        }
      }
    }
    if (dictionary.isInitialized) {
      performInitialLookups();
    }
    if (postFillEvents) {
      postMessage({
        'type': "fillEvent",
        'name': "slotCandidatesRefreshed"
      });
    }
    determinePuzzleRegions();
    if (typeof editProcessingComplete !== 'undefined') {
      const _0x85a60 = [];
      for (let _0x484b1c = 0x0; _0x484b1c < _0x160ca0.length; _0x484b1c++) {
        if (_0x160ca0[_0x484b1c] && !slotList[_0x484b1c].isFilled && !slotList[_0x484b1c].isAllBlank) {
          _0x85a60.push(slotList[_0x484b1c]);
        }
      }
      if (_0x85a60.length > 0x0) {
        editProcessingComplete(_0x85a60);
      }
    }
  } catch (_0x2a362b) {
    reportError("fillLib.processCharEdits", _0x2a362b, {
      'charEdit': _0x5cdc22
    }, true);
  } finally {
    charEditsBeingProcessed = false;
  }
}
function initializeSlots() {
  slotList = [];
  slots = {};
  grid.acrossWords.forEach(_0x196e88 => {
    const _0x38ed40 = new Slot(slotList.length, _0x196e88.startColNum, _0x196e88.rowNum, _0x196e88.wordNum, _0x196e88.length, _0x196e88.dir);
    slotList.push(_0x38ed40);
    slots[Slot.formatName(_0x196e88.wordNum, Direction.ACROSS)] = _0x38ed40;
  });
  grid.downWords.forEach(_0x41b775 => {
    const _0x3108af = new Slot(slotList.length, _0x41b775.startRowNum, _0x41b775.colNum, _0x41b775.wordNum, _0x41b775.length, _0x41b775.dir);
    slotList.push(_0x3108af);
    slots[Slot.formatName(_0x41b775.wordNum, Direction.DOWN)] = _0x3108af;
  });
  slotList.forEach(_0x5a66a7 => {
    const _0x6104b1 = _0x5a66a7.dir === Direction.ACROSS ? Direction.DOWN : Direction.ACROSS;
    for (let _0x561ff7 = 0x0; _0x561ff7 < _0x5a66a7.length; _0x561ff7++) {
      const _0x161854 = _0x561ff7 + _0x5a66a7.startPos;
      const _0x48848e = slotList.find(_0x18085f => _0x18085f.matches(_0x6104b1, _0x161854, _0x5a66a7.slotPos));
      _0x5a66a7.crossers[_0x561ff7] = _0x48848e;
      if (!_0x48848e) {
        _0x5a66a7.isUnchecked = true;
      }
    }
  });
  for (let _0x317ec5 = 0x0; _0x317ec5 < grid.size.height; _0x317ec5++) {
    for (let _0x4e3005 = 0x0; _0x4e3005 < grid.size.width; _0x4e3005++) {
      const _0x34f4d3 = grid.gridChars[_0x317ec5][_0x4e3005];
      if (!_0x34f4d3.char) {
        continue;
      }
      if (_0x34f4d3.acrossWordInfo) {
        const _0x4ef8b9 = slots[Slot.formatName(_0x34f4d3.acrossWordInfo.wordNum, Direction.ACROSS)];
        _0x4ef8b9.addChar(_0x4e3005 - _0x4ef8b9.startPos, _0x34f4d3.char);
      }
      if (_0x34f4d3.downWordInfo) {
        const _0x4e829b = slots[Slot.formatName(_0x34f4d3.downWordInfo.wordNum, Direction.DOWN)];
        _0x4e829b.addChar(_0x317ec5 - _0x4e829b.startPos, _0x34f4d3.char);
      }
    }
  }
  initializeGridWords("gridChange");
}
function initializeGridWords(_0x39d65c) {
  words = [];
  slotList.forEach(_0x1494c6 => {
    if (!_0x1494c6.hasBlanks) {
      words.push({
        'slot': _0x1494c6,
        'entry': _0x1494c6.wordInfo
      });
    }
  });
  if (postFillEvents) {
    postMessage({
      'type': "fillEvent",
      'name': "newWords",
      'data': {
        'words': words.map(_0x4aa47c => _0x4aa47c.entry),
        'source': _0x39d65c
      }
    });
  }
}
function getCurrentGridHash() {
  return grid.gridChars.map(_0x4439a3 => {
    return _0x4439a3.reduce((_0x3a743e, _0x3decf6) => _0x3a743e + (_0x3decf6.isBlock ? '.' : _0x3decf6.char ? _0x3decf6.char : '?'), '');
  }).join('');
}
function determinePuzzleRegions() {
  slotList.forEach(_0x20d9b4 => _0x20d9b4.region = undefined);
  const _0x4f3064 = function (_0x101127) {
    if (!regionIsSeeded[_0x101127.region - 0x1]) {
      regionIsSeeded[_0x101127.region - 0x1] = Boolean(_0x101127.baseCandidates);
    }
    for (let _0x1d7398 = 0x0; _0x1d7398 < _0x101127.crossers.length; _0x1d7398++) {
      if (!_0x101127.crossers[_0x1d7398]) {
        continue;
      }
      if (_0x101127.chars[_0x1d7398] === undefined && _0x101127.crossers[_0x1d7398].region === undefined) {
        _0x101127.crossers[_0x1d7398].region = _0x101127.region;
        regionSlots[_0x101127.region - 0x1].push(_0x101127.crossers[_0x1d7398]);
        _0x4f3064(_0x101127.crossers[_0x1d7398]);
      }
    }
  };
  regionSlots = [];
  regionIsSeeded = [];
  let _0x17a5e2 = 0x0;
  let _0xeeb880;
  while (_0xeeb880 = slotList.find(_0x568c7d => _0x568c7d.hasBlanks && _0x568c7d.region === undefined)) {
    _0xeeb880.region = ++_0x17a5e2;
    regionSlots.push([]);
    regionSlots[_0xeeb880.region - 0x1].push(_0xeeb880);
    _0x4f3064(_0xeeb880);
  }
}
function performInitialLookups() {
  if (!hasUnprocessedEdits && !newFilterChange) {
    reportError("fillLib.findConstrainedSlots", Error("Unexpected call to findConstrainedSlots"), {
      'hasUnprocessedEdits': hasUnprocessedEdits,
      'newFilterChange': newFilterChange
    });
  }
  const _0xd78334 = [];
  if (hasUnprocessedEdits || newFilterChange) {
    slotList.forEach(_0x1bfb66 => {
      _0x1bfb66.hasPrefillCandidates = false;
      if (_0x1bfb66.isAllBlank && !_0x1bfb66.hasIncludeWordFilter && !_0x1bfb66.hasMinScoreFilter && !_0x1bfb66.hasAltWordList) {
        return;
      }
      if (!_0x1bfb66.hasBlanks) {
        _0x1bfb66.hasNoOptions = _0x1bfb66.hasLowOptions = false;
        return;
      }
      if (_0x1bfb66.length <= 0x2) {
        return;
      }
      _0x1bfb66.performInitialLookup(_0x1bfb66.chars);
      _0x1bfb66.baseCandidates = _0x1bfb66.candidateStack[0x0];
      _0x1bfb66.hasPrefillCandidates = true;
      _0x1bfb66.findCurrentCharOptions();
      _0xd78334.push(_0x1bfb66);
      if (_0x1bfb66.staleOptions && _0x1bfb66.hasIncludeWordFilter) {
        for (let _0x457f8d = 0x0; _0x457f8d < _0x1bfb66.staleOptions.length; _0x457f8d++) {
          const _0x3b039b = _0x1bfb66.baseCandidates.find(_0x3395b7 => _0x3395b7.w === _0x1bfb66.staleOptions[_0x457f8d].entry.w);
          if (_0x3b039b) {
            _0x1bfb66.staleOptions[_0x457f8d].entry = _0x3b039b;
          }
        }
      }
    });
    slotList.forEach(_0xb451dd => {
      if (_0xb451dd.length <= 0x2 || _0xb451dd.hasPrefillCandidates || !_0xb451dd.hasBlanks) {
        return;
      }
      const _0x2394c0 = new Array(_0xb451dd.length);
      for (let _0x8e3d69 = 0x0; _0x8e3d69 < _0xb451dd.length; _0x8e3d69++) {
        const _0x1653bf = _0xb451dd.crossers[_0x8e3d69];
        if (!_0x1653bf || !_0x1653bf.getCurrentCharOptions()) {
          continue;
        }
        _0x2394c0[_0x8e3d69] = _0x1653bf.getCurrentCharOptions()[_0xb451dd.slotPos - _0x1653bf.startPos];
      }
      if (_0x2394c0.some(_0x1c3b4e => Boolean(_0x1c3b4e))) {
        _0xb451dd.performInitialLookup(convertToCharOptionLists(_0x2394c0), true);
        if (_0xb451dd.candidateStack.length > 0x0) {
          _0xb451dd.baseCandidates = _0xb451dd.candidateStack[0x0];
          _0xb451dd.hasPrefillCandidates = true;
          _0xb451dd.findCurrentCharOptions();
        }
      }
      _0xd78334.push(_0xb451dd);
    });
    if (newFilterChange) {
      cachedSlotOptions = {};
      cachedSingleCharOptions = {};
      cachedSlotColors = {};
    }
    hasUnprocessedEdits = newFilterChange = false;
  }
  if (postFillEvents) {
    emitSlotColorEvents(grid.id);
  }
  let _0x295d5a;
  do {
    _0x295d5a = false;
    _0xd78334.forEach(_0xecd26c => {
      let _0xe808a5;
      if (!_0xecd26c.hasPrefillCandidates) {
        _0xe808a5 = new Array(_0xecd26c.length);
        for (let _0x112b9 = 0x0; _0x112b9 < _0xecd26c.length; _0x112b9++) {
          const _0x5564fd = _0xecd26c.crossers[_0x112b9];
          if (!_0x5564fd || !_0x5564fd.getCurrentCharOptions()) {
            continue;
          }
          _0xe808a5[_0x112b9] = _0x5564fd.getCurrentCharOptions()[_0xecd26c.slotPos - _0x5564fd.startPos];
        }
        if (_0xe808a5.some(_0x407deb => Boolean(_0x407deb))) {
          _0xecd26c.performInitialLookup(convertToCharOptionLists(_0xe808a5), true);
          if (_0xecd26c.candidateStack.length > 0x0) {
            _0xecd26c.baseCandidates = _0xecd26c.candidateStack[0x0];
            _0xecd26c.hasPrefillCandidates = true;
            _0xecd26c.findCurrentCharOptions();
            _0x295d5a = true;
          }
        }
      } else {
        const _0x55d02e = _0xecd26c.getCurrentCharOptions();
        for (let _0x3d84d9 = 0x0; _0x3d84d9 < _0xecd26c.length; _0x3d84d9++) {
          if (!_0x55d02e[_0x3d84d9]) {
            continue;
          }
          const _0x1010bb = _0xecd26c.crossers[_0x3d84d9];
          if (!_0x1010bb || !_0x1010bb.getCurrentCharOptions()) {
            continue;
          }
          const _0x13653e = _0x1010bb.getCurrentCharOptions()[_0xecd26c.slotPos - _0x1010bb.startPos];
          if (!_0x13653e) {
            continue;
          }
          const _0x361962 = new Array(0x24);
          let _0x4a66c1;
          for (let _0x21388d = 0x0; _0x21388d < 0x24; _0x21388d++) {
            _0x361962[_0x21388d] = _0x13653e[_0x21388d] && _0x55d02e[_0x3d84d9][_0x21388d];
            if (false && _0x55d02e[_0x3d84d9][_0x21388d] && !_0x361962[_0x21388d]) {
              _0x4a66c1 = true;
            }
          }
          _0xe808a5 = _0xe808a5 || new Array(_0xecd26c.length);
          _0xe808a5[_0x3d84d9] = _0x361962;
        }
        if (_0xe808a5) {
          _0xecd26c.applyNewCharOptions(_0xe808a5);
          _0x295d5a = true;
        }
      }
    });
  } while (_0x295d5a === true);
  const _0xbb2c84 = cachedSlotOptions[gridHash];
  if (_0xbb2c84) {
    for (let _0x30e68b = 0x0; _0x30e68b < _0xbb2c84.length; _0x30e68b++) {
      if (_0xbb2c84[_0x30e68b]) {
        slotList[_0x30e68b].validOptions = _0xbb2c84[_0x30e68b].validOptions;
        delete slotList[_0x30e68b].staleOptions;
        slotList[_0x30e68b].invalidOptions = _0xbb2c84[_0x30e68b].invalidOptions;
        slotList[_0x30e68b].foundAllOptions = _0xbb2c84[_0x30e68b].foundAllOptions;
        if (_0xbb2c84[_0x30e68b].baseCandidates) {
          slotList[_0x30e68b].baseCandidates = slotList[_0x30e68b].candidateStack[0x0] = _0xbb2c84[_0x30e68b].baseCandidates;
          slotList[_0x30e68b].hasPrefillCandidates = true;
        }
      }
    }
  }
  let _0xc7bcc3 = cachedSingleCharOptions[gridHash];
  if (!_0xc7bcc3) {
    _0xc7bcc3 = new Array(grid.size.height);
    for (let _0x14c71e = 0x0; _0x14c71e < grid.size.height; _0x14c71e++) {
      _0xc7bcc3[_0x14c71e] = new Array(grid.size.width);
    }
    slotList.forEach(_0x372ebd => {
      const _0x27d577 = _0x372ebd.getCurrentCharOptions();
      if (_0x27d577) {
        for (let _0x514a12 = 0x0; _0x514a12 < _0x372ebd.length; _0x514a12++) {
          if (_0x27d577[_0x514a12] && _0x27d577[_0x514a12].reduce((_0x3d95aa, _0x1f0cfa) => _0x3d95aa + (_0x1f0cfa ? 0x1 : 0x0), 0x0) === 0x1) {
            const {
              irow: _0x3611f4,
              icol: _0x376902
            } = _0x372ebd.getGridCoords(_0x514a12);
            _0xc7bcc3.found = true;
            _0xc7bcc3[_0x3611f4][_0x376902] = Dictionary.getCharFromCode(_0x27d577[_0x514a12].indexOf(true));
          }
        }
      }
    });
    cachedSingleCharOptions[gridHash] = _0xc7bcc3;
  }
  if (postFillEvents) {
    postMessage({
      'type': "fillEvent",
      'name': "showSingleCharOptions",
      'singleCharOptions': _0xc7bcc3,
      'gridId': grid.id
    });
  }
}
function convertToCharOptionLists(_0x482a3b) {
  const _0x5299d7 = new Array(_0x482a3b.length);
  for (let _0x322740 = 0x0; _0x322740 < _0x482a3b.length; _0x322740++) {
    if (!_0x482a3b[_0x322740]) {
      continue;
    }
    _0x5299d7[_0x322740] = [];
    for (let _0x3aff2c = 0x0; _0x3aff2c < _0x482a3b[_0x322740].length; _0x3aff2c++) {
      if (_0x482a3b[_0x322740][_0x3aff2c]) {
        _0x5299d7[_0x322740].push(Dictionary.getCharFromCode(_0x3aff2c));
      }
    }
  }
  return _0x5299d7;
}
function emitSlotColorEvents(_0x4c7610) {
  slotList.forEach(_0x5f4495 => {
    if (_0x5f4495.numCandidates > 0x0 && _0x5f4495.hasNoOptions) {
      _0x5f4495.hasNoOptions = false;
      postMessage({
        'type': 'fillEvent',
        'name': "resetSlotColor",
        'slot': _0x5f4495.location,
        'gridId': _0x4c7610
      });
    }
    if ((_0x5f4495.numCandidates === 0x0 || _0x5f4495.numCandidates > 0xa) && _0x5f4495.hasLowOptions) {
      _0x5f4495.hasLowOptions = false;
      postMessage({
        'type': 'fillEvent',
        'name': "resetSlotColor",
        'slot': _0x5f4495.location,
        'gridId': _0x4c7610
      });
    }
  });
  const _0x490287 = [];
  slotList.forEach(_0x416cc2 => {
    const _0x2fbe2f = _0x416cc2.numCandidates;
    if (_0x416cc2.isAllBlank) {
      return;
    }
    if (_0x2fbe2f === 0x0) {
      _0x416cc2.hasNoOptions = true;
      postMessage({
        'type': "fillEvent",
        'name': "setSlotColor",
        'slot': _0x416cc2.location,
        'color': "red",
        'gridId': _0x4c7610
      });
      _0x490287.push([_0x416cc2, "red"]);
    } else if (_0x2fbe2f > 0x0 && _0x2fbe2f <= 0xa && !_0x416cc2.hasIncludeWordFilter) {
      _0x416cc2.hasLowOptions = true;
      postMessage({
        'type': "fillEvent",
        'name': 'setSlotColor',
        'slot': _0x416cc2.location,
        'color': "yellow",
        'gridId': _0x4c7610
      });
      _0x490287.push([_0x416cc2, "yellow"]);
    }
  });
  cachedSlotColors[gridHash] = _0x490287;
}
function getSlotColors() {
  return cachedSlotColors[gridHash];
}
function getSingleCharOptions() {
  return cachedSingleCharOptions[gridHash];
}
function getGridInfo() {
  const _0x1928bd = new Array(grid.size.height * grid.size.width);
  for (let _0x2d11f0 = 0x0; _0x2d11f0 < grid.size.height * grid.size.width; _0x2d11f0++) {
    _0x1928bd[_0x2d11f0] = '.';
  }
  slotList.forEach(_0x4ea21d => {
    if (_0x4ea21d.dir === Direction.DOWN) {
      return;
    }
    for (let _0x573e60 = 0x0; _0x573e60 < _0x4ea21d.length; _0x573e60++) {
      _0x1928bd[_0x4ea21d.slotPos * grid.size.width + _0x4ea21d.startPos + _0x573e60] = _0x4ea21d.chars[_0x573e60] || '?';
    }
  });
  return {
    'chars': _0x1928bd.join(''),
    'size': grid.size
  };
}
function byGridPos(_0x1feb6c, _0x5c6f1f) {
  if (_0x1feb6c.dir < _0x5c6f1f.dir) {
    return -0x1;
  } else {
    if (_0x1feb6c.dir > _0x5c6f1f.dir) {
      return 0x1;
    } else {
      return _0x1feb6c.num - _0x5c6f1f.num;
    }
  }
}
function getSlotFilter(_0x3f444a, _0x27e91c) {
  const _0x4ff18c = slots[Slot.formatName(_0x3f444a, _0x27e91c)];
  if (_0x4ff18c) {
    _0x4ff18c.filter = _0x4ff18c.filter || {};
  }
  return _0x4ff18c && _0x4ff18c.filter;
}
async function setSlotFilters(_0x1d55c0) {
  for (const [_0x3faf46, _0x38af12] of Object.entries(_0x1d55c0)) {
    if (self.name === "FillWorker" && _0x38af12.wordFilter) {
      removeWordFilterDupes(_0x38af12.wordFilter);
      if (isDictionaryInitializing) {
        await dictionaryInitialized();
      }
      for (let _0x5f01dd = 0x0; _0x5f01dd < _0x38af12.wordFilter.list.length; _0x5f01dd++) {
        const {
          entry: _0x5aefe4
        } = dictionary.getEntry(_0x38af12.wordFilter.list[_0x5f01dd].w);
        if (_0x5aefe4) {
          _0x38af12.wordFilter.list[_0x5f01dd].s = _0x5aefe4.s;
        }
        const _0x1f2158 = dictionary.sampleClues.get(_0x38af12.wordFilter.list[_0x5f01dd].w);
        if (_0x1f2158) {
          _0x38af12.wordFilter.list[_0x5f01dd].c = _0x1f2158;
        }
      }
    }
    slots[_0x3faf46].filter = _0x38af12;
  }
}
function removeWordFilterDupes(_0x37288f) {
  const _0x42434f = new Set();
  const _0x2ab554 = [];
  let _0x226a44;
  for (let _0x6687bc = 0x0; _0x6687bc < _0x37288f.list.length; _0x6687bc++) {
    if (_0x42434f.has(_0x37288f.list[_0x6687bc].w)) {
      _0x226a44 = true;
    } else {
      _0x2ab554.push(_0x37288f.list[_0x6687bc]);
      _0x42434f.add(_0x37288f.list[_0x6687bc].w);
    }
  }
  _0x37288f.list = _0x2ab554;
  reportError("fillWorker.removeWordFilterDupes", Error("Found dupe in word filter"));
}
function terminate() {
  return new Promise(_0xf555b0 => {
    if (!fillOpInProgress()) {
      return _0xf555b0();
    }
    stopProcessing = true;
    self.dispatchEvent(new Event('terminateSearch'));
    self.addEventListener('searchComplete', () => {
      if (stopProcessing) {
        clearFillCandidates(false);
      }
      stopProcessing = false;
      _0xf555b0();
    }, {
      'once': true
    });
  });
}
function clearFillCandidates(_0x46b069, _0x46e941) {
  slotList.forEach(_0x28a14c => {
    if (_0x28a14c.fillCharStack.length > 0x1) {
      _0x28a14c.fillCharStack.splice(0x1);
    }
    if (_0x46b069 || !_0x28a14c.hasPrefillCandidates) {
      _0x28a14c.candidateStack = [];
      delete _0x28a14c.baseCandidates;
    } else {
      _0x28a14c.candidateStack.splice(0x1);
    }
    if (_0x46b069) {
      delete _0x28a14c.validOptions;
      if (!_0x46b069.isConstraining) {
        delete _0x28a14c.invalidOptions;
      }
      delete _0x28a14c.gridScoreNormFactor;
      delete _0x28a14c.hasPrefillCandidates;
    }
  });
  if (words && words.some(_0x327f2d => _0x327f2d.entry.isFill)) {
    words = words.filter(_0x214a78 => !_0x214a78.entry.isFill);
    if (!_0x46e941) {
      postMessage({
        'type': "fillEvent",
        'name': "newWords",
        'data': {
          'words': words.map(_0x403a69 => _0x403a69.entry),
          'source': "clearedFill"
        }
      });
    }
  }
}
async function search() {
  if (!state.resortCands) {
    slotList.forEach(_0x2e0a2a => {
      if (_0x2e0a2a.candidateStack.length === 0x1 && _0x2e0a2a.candidateStack[0x0].resorted) {
        _0x2e0a2a.candidateStack[0x0].sort(dictionary.wordCompare);
      }
    });
  }
  if (state.iterativeBroadening) {
    let _0x4d0109;
    do {
      state.searchWidth = state.searchWidth ? state.searchWidth + 0x1 : 0x1;
      state.searchTruncated = false;
      await fillSlot();
      _0x4d0109 = !stopProcessing && !state.timedOut && !state.countThresholdReached && state.searchTruncated;
      if (_0x4d0109) {
        clearFillCandidates(false);
      }
    } while (_0x4d0109);
  } else {
    await fillSlot();
  }
}
async function fillSlot() {
  let _0x14d33c;
  if (state.mode === Mode.EVALUATE_SLOT_OPTIONS) {
    _0x14d33c = getMostConstrainedSlot(state.neighboringSlots);
    state.maxRemainingScore -= _0x14d33c.maxScorfillSlote;
  } else {
    if (state.mode === Mode.FIND_SLOT_OPTIONS || state.mode === Mode.FIND_SINGLE_SLOT_OPTION) {
      let _0x37679c;
      while (!_0x14d33c && (_0x37679c = state.subregionStack.getCurrent())) {
        _0x14d33c = getMostConstrainedSlot(_0x37679c.slots);
        if (!_0x14d33c) {
          _0x37679c.recordValidFill();
          state.subregionStack.setCurrentRegionFilled();
          if (state.prevSlot === _0x37679c.separator) {
            _0x37679c.isPrefilled = true;
          }
        }
      }
    }
    if (!_0x14d33c) {
      _0x14d33c = determineNextFillSlot();
    }
  }
  state.searchLevel++;
  if (state.mode === Mode.FIND_SLOT_OPTIONS || state.mode === Mode.FIND_SINGLE_SLOT_OPTION) {
    state.searchTreeSlots[_0x14d33c.index] = 0x1;
  }
  if (state.debug) {
    console.log("I'm looking at slot " + _0x14d33c.name);
  }
  if (state.resortCands) {
    resortCandidates(_0x14d33c);
  }
  let _0x3c88bc = _0x14d33c.getCurrentCandidates();
  if (state.mode === Mode.FIND_SLOT_OPTIONS && state.targetSlot === _0x14d33c) {
    _0x3c88bc = _0x3c88bc.slice();
  }
  let _0x5260ae;
  if (_0x14d33c.subregionInfo) {
    _0x14d33c.subregionInfo.searchLevel = state.searchLevel;
    state.subregionStack.add(_0x14d33c.subregionInfo);
    _0x5260ae = _0x14d33c.subregionInfo.slots.every(_0x2ed0f0 => state.searchTreeSlots[_0x2ed0f0.index] === 0x0);
  }
  if (state.mode === Mode.EVALUATE_SLOT_OPTIONS) {
    state.maxRemaining -= _0x14d33c.maxScore;
  }
  let _0x1d646c;
  const _0x473432 = new Array(_0x14d33c.length);
  let _0x542419;
  if (state.iterativeBroadening && _0x3c88bc.length > state.searchWidth) {
    state.searchTruncated = true;
    _0x542419 = state.searchWidth;
  } else {
    _0x542419 = _0x3c88bc.length;
  }
  for (let _0x3c2f1c = 0x0; _0x3c2f1c < _0x14d33c.length; _0x3c2f1c++) {
    if (_0x14d33c.chars[_0x3c2f1c] || _0x14d33c.getFillChar(_0x3c2f1c)) {
      continue;
    }
    const _0x526f5d = _0x14d33c.crossers[_0x3c2f1c];
    if (_0x526f5d) {
      state.dependencyGraph.addDependency(_0x14d33c, _0x526f5d);
    }
  }
  _0x467bb8: for (let _0x17512c = 0x0; _0x17512c < _0x542419; _0x17512c++) {
    if (state.mode === Mode.EVALUATE_SLOT_OPTIONS && _0x3c88bc[_0x17512c].s + state.maxRemainingScore + state.gridScore < state.maxGridScore) {
      continue _0x467bb8;
    }
    if ((state.mode === Mode.FIND_SLOT_OPTIONS || state.mode === Mode.FIND_SINGLE_SLOT_OPTION) && state.targetSlot === _0x14d33c && state.validOptions.some(_0x2dc02b => _0x2dc02b.entry === _0x3c88bc[_0x17512c])) {
      if (state.debug) {
        console.log("Skipping " + _0x3c88bc[_0x17512c].w + " -- we already know this is a valid slot option");
      }
      continue _0x467bb8;
    }
    let _0x3e7385 = words.find(_0x4e9e63 => _0x4e9e63.entry.w === _0x3c88bc[_0x17512c].w);
    if (_0x3e7385) {
      if (state.debug) {
        console.log("Skipping " + _0x3c88bc[_0x17512c].w + " -- this word is already in puzzle");
      }
      _0x1d646c = _0x1d646c || [];
      _0x1d646c.push(_0x3e7385.slot);
      if (state.mode === Mode.FIND_SLOT_OPTIONS || state.mode === Mode.FIND_SINGLE_SLOT_OPTION) {
        state.subregionStack.recordDupe(_0x14d33c, _0x3e7385.slot);
      }
      continue _0x467bb8;
    }
    if (state.mode === Mode.FULL_SOLUTION && state.removedWords.includes(_0x3c88bc[_0x17512c].w)) {
      if (state.debug) {
        console.log("Skipping " + _0x3c88bc[_0x17512c].w + " -- been excluded from fill");
      }
      continue _0x467bb8;
    }
    if (_0x14d33c.subregionInfo) {
      if (_0x14d33c.subregionInfo.searchedSubstrings.some(_0x231619 => _0x231619.matches(_0x3c88bc[_0x17512c].w))) {
        if (state.debug) {
          console.log("Skipping " + _0x3c88bc[_0x17512c].w + " -- already searched substring");
        }
        addMaxDependencies(_0x14d33c);
        continue _0x467bb8;
      }
      if (_0x14d33c.subregionInfo.isUnfillable(_0x3c88bc[_0x17512c].w)) {
        if (state.debug) {
          console.log("Skipping " + _0x3c88bc[_0x17512c].w + " -- it led to an unfillable subregion");
        }
        addMaxDependencies(_0x14d33c);
        continue _0x467bb8;
      }
    }
    const _0x338fdb = _0x14d33c.getCrosserCandidates(_0x3c88bc[_0x17512c].w);
    if (_0x338fdb) {
      for (let _0x2bc767 = 0x0; _0x2bc767 < _0x338fdb.length; _0x2bc767++) {
        const _0x5c64d1 = _0x338fdb[_0x2bc767].w;
        _0x3e7385 = words.find(_0x2d2964 => _0x2d2964.entry.w === _0x5c64d1);
        if (_0x3e7385 || _0x5c64d1 === _0x3c88bc[_0x17512c].w) {
          if (state.debug) {
            console.log("Skipping " + _0x3c88bc[_0x17512c].w + " -- this word leads to a crosser (" + _0x5c64d1 + ") is already in puzzle");
          }
          if (_0x3e7385) {
            _0x1d646c = _0x1d646c || [];
            _0x1d646c.push(_0x3e7385.slot);
            if (state.mode === Mode.FIND_SLOT_OPTIONS || state.mode === Mode.FIND_SINGLE_SLOT_OPTION) {
              state.subregionStack.recordDupe(_0x338fdb[_0x2bc767].slot, _0x3e7385.slot);
            }
          }
          continue _0x467bb8;
        }
        for (let _0x16fa10 = _0x2bc767 + 0x1; _0x16fa10 < _0x338fdb.length; _0x16fa10++) {
          if (_0x5c64d1 === _0x338fdb[_0x16fa10].w) {
            if (state.debug) {
              console.log("Skipping " + _0x3c88bc[_0x17512c].w + " -- this word leads to dupe crossers (" + _0x5c64d1 + ')');
            }
            continue _0x467bb8;
          }
        }
      }
    }
    for (let _0xa93f37 = 0x0; _0xa93f37 < _0x473432.length; _0xa93f37++) {
      if (_0x473432[_0xa93f37] && _0x473432[_0xa93f37].includes(_0x14d33c.getChar(_0x3c88bc[_0x17512c].w, _0xa93f37))) {
        if (state.debug) {
          console.log("Skipping " + _0x3c88bc[_0x17512c].w + " -- this word leads to slot with zero crossers");
        }
        continue _0x467bb8;
      }
    }
    const _0x57a6bb = _0x14d33c.pushFillCandidate(_0x3c88bc[_0x17512c]);
    if (state.debug) {
      displayFill(_0x57a6bb, _0x14d33c);
    }
    const _0x55e846 = [];
    const _0x1e564f = [];
    const _0x37f967 = [];
    for (let _0x3d2216 = 0x0; _0x3d2216 < _0x14d33c.length; _0x3d2216++) {
      if (_0x57a6bb.chars[_0x3d2216]) {
        const _0x4dc5c8 = _0x14d33c.crossers[_0x3d2216];
        if (!_0x4dc5c8) {
          continue;
        }
        const _0x3ef842 = _0x4dc5c8.pushFillChar(_0x57a6bb.chars[_0x3d2216], _0x14d33c.slotPos);
        _0x55e846.push({
          'slot': _0x4dc5c8,
          'type': FillAction.NEW_FILL_CHAR
        });
        if (_0x4dc5c8.length > 0x2 && _0x4dc5c8.numCandidates === 0x0) {
          if (state.debug) {
            console.log(_0x14d33c.name + " candidate " + _0x3c88bc[_0x17512c].w + " failed. No candidates on crosser " + _0x4dc5c8.name);
          }
          let _0x3dbedb = _0x473432[_0x3d2216];
          if (!_0x3dbedb) {
            _0x3dbedb = _0x473432[_0x3d2216] = [];
          }
          _0x3dbedb.push(_0x57a6bb.chars[_0x3d2216]);
          const _0x39cb3a = rollbackFillActions(_0x14d33c, _0x55e846);
          if (state.debug) {
            hideFill(_0x39cb3a, _0x14d33c);
          }
          continue _0x467bb8;
        }
        if (_0x3ef842.dictEntry && ((state.mode === Mode.FIND_SLOT_OPTIONS || state.mode === Mode.FIND_SINGLE_SLOT_OPTION) && _0x4dc5c8 === state.targetSlot && state.validOptions.some(_0x456d8b => _0x456d8b.entry === _0x3ef842.dictEntry) || state.mode === Mode.FULL_SOLUTION && state.removedWords.includes(_0x3ef842.dictEntry.w))) {
          if (state.debug) {
            console.log(_0x14d33c.name + " candidate " + _0x3c88bc[_0x17512c].w + " failed. Invalid candidates on crosser " + _0x4dc5c8.name);
          }
          const _0x117ab6 = rollbackFillActions(_0x14d33c, _0x55e846);
          if (state.debug) {
            hideFill(_0x117ab6, _0x14d33c);
          }
          continue _0x467bb8;
        }
        _0x3ef842.blankIndexes.forEach(_0x578583 => {
          const _0x1746c7 = _0x4dc5c8.crossers[_0x578583];
          if (_0x1746c7 && !_0x37f967.includes(_0x1746c7)) {
            _0x37f967.push(_0x1746c7);
          }
        });
        _0x1e564f.push(_0x4dc5c8);
      }
    }
    let _0x556667;
    if (_0x556667 = purgeCandidates(_0x14d33c, _0x37f967, _0x1e564f, _0x55e846)) {
      if (state.debug) {
        console.log(_0x14d33c.name + " candidate " + _0x3c88bc[_0x17512c].w + " failed. No candidates on nearby slot " + _0x556667.name);
      }
      const _0x1453b9 = rollbackFillActions(_0x14d33c, _0x55e846);
      if (state.debug) {
        hideFill(_0x1453b9, _0x14d33c);
      }
      continue _0x467bb8;
    }
    const _0x12096a = _0x14d33c.wordInfo;
    words.push({
      'slot': _0x14d33c,
      'entry': _0x12096a
    });
    state.dependencyGraph.markFilled(_0x14d33c);
    if (state.mode === Mode.EVALUATE_SLOT_OPTIONS) {
      state.gridScore += _0x12096a.s || 0x0;
    }
    if (_0x338fdb) {
      _0x338fdb.forEach(_0x31dede => {
        let _0x162c6a;
        try {
          _0x162c6a = _0x31dede.slot.wordInfo;
        } catch (_0x3a57df) {
          const {
            fillChars: _0x4a8378
          } = getSolution();
          const _0x2b0a9d = [];
          for (let _0x22a7d6 = 0x0; _0x22a7d6 < _0x4a8378.length; _0x22a7d6++) {
            for (let _0x2d4eac = 0x0; _0x2d4eac < _0x4a8378[_0x22a7d6].length; _0x2d4eac++) {
              _0x2b0a9d.push(_0x4a8378[_0x22a7d6][_0x2d4eac] || '.');
            }
          }
          reportError("filler.fillSlot", _0x3a57df, {
            'slot': _0x14d33c.name,
            'crosser': _0x31dede.slot.name,
            'crosserCand': _0x31dede.w,
            'fillChars': _0x2b0a9d.join(''),
            'language': navigator.language,
            'fillCharBlankIndexes': _0x31dede.slot.fillCharStack.map(_0x26fe35 => _0x26fe35.blankIndexes.length),
            'fillDictEntries': _0x31dede.slot.fillCharStack.map(_0x4bd1c1 => _0x4bd1c1.dictEntry),
            'candStack': _0x31dede.slot.candidateStack.map(_0x5816de => _0x5816de.length),
            'currCands': _0x31dede.slot.getCurrentCandidates()
          }, true);
          throw _0x3a57df;
        }
        words.push({
          'slot': _0x14d33c,
          'entry': _0x162c6a
        });
        state.dependencyGraph.markFilled(_0x31dede.slot);
        if (state.mode === Mode.EVALUATE_SLOT_OPTIONS) {
          if (_0x31dede.slot.maxScore) {
            state.gridScore += _0x162c6a.s || 0x0;
            state.maxRemainingScore -= _0x31dede.slot.maxScore;
          }
        }
      });
    }
    if (state.debug) {
      console.log("Added " + _0x14d33c.name + " candidate", _0x3c88bc[_0x17512c]);
    }
    if (_0x14d33c.subregionInfo && !_0x14d33c.subregionInfo.isFilled && _0x14d33c.subregionInfo.isFillable(_0x3c88bc[_0x17512c].w)) {
      state.subregionStack.setCurrentRegionFilled();
    }
    if (state.subregions) {
      state.subregions.forEach(_0x4f7409 => {
        if (_0x4f7409.searchLevel > state.searchLevel && _0x4f7409.searchedSubstrings.length > 0x0 && _0x4f7409.isExternal(_0x14d33c)) {
          _0x4f7409.clearSearchedSubstrings();
        }
      });
    }
    const _0x4f5143 = Date.now();
    if (_0x4f5143 - state.lastBreak > 0x1f4) {
      state.lastBreak = _0x4f5143;
      await new Promise(_0x281fac => {
        setTimeout(_0x281fac, 0x0);
      });
    }
    state.numSearchIterations++;
    if (state.timeoutThreshold && _0x4f5143 - state.startTime > state.timeoutThreshold) {
      state.timedOut = true;
      return;
    }
    if (isPuzzleFilled(state)) {
      if (stopProcessing) {
        return;
      }
      let _0x470370;
      if (state.mode === Mode.FULL_SOLUTION) {
        const {
          fillChars: _0x261275,
          fillEntries: _0xe2c933
        } = getSolution();
        if (!state.iterativeBroadening || !isDupeSolution(_0xe2c933)) {
          state.sols.push({
            'fillChars': _0x261275,
            'fillEntries': _0xe2c933
          });
          state.numSolutions++;
          if (state.countMode) {
            if (state.numSolutions === 0x64) {
              state.countThresholdReached = true;
              _0x470370 = {
                'value': ResumeAction.END_SEARCH
              };
            } else {
              emitFoundFillEvent(_0x261275);
              _0x470370 = {
                'value': ResumeAction.FIND_NEXT
              };
            }
          } else {
            _0x470370 = await showSolution(_0x261275);
            state.startTime = Date.now();
          }
          if (_0x470370.value === ResumeAction.END_SEARCH) {
            return;
          }
        }
      } else {
        if (state.mode === Mode.FIND_SLOT_OPTIONS) {
          state.validOptions.push({
            'entry': state.targetSlot.entry
          });
          state.targetSlot.candidateStack.forEach(_0x123496 => {
            const _0xc865e8 = _0x123496.indexOf(state.targetSlot.entry);
            _0x123496.splice(_0xc865e8, 0x1);
          });
          if (state.targetSlot.baseCandidates !== state.targetSlot.candidateStack[0x0]) {
            const _0x256f7a = state.targetSlot.baseCandidates.indexOf(state.targetSlot.entry);
            state.targetSlot.baseCandidates.splice(_0x256f7a, 0x1);
          }
          const _0x25acec = state.targetSlot.counts;
          _0x25acec.candidates += _0x25acec.validOptions;
          postMessage({
            'type': "fillEvent",
            'name': "foundSlotOption",
            'entry': state.targetSlot.entry,
            'wordNum': state.targetSlot.wordNum,
            'dir': state.targetSlot.dir,
            'counts': _0x25acec
          });
          if (state.validOptions.length === maxSlotOptions) {
            state.countThresholdReached = true;
            return;
          }
          state.subregionStack.stack.forEach(_0x43f09a => {
            if (!_0x43f09a.isFilled) {
              _0x43f09a.isFilled = true;
              _0x43f09a.recordValidFill();
            }
          });
        } else {
          if (state.mode === Mode.FIND_SINGLE_SLOT_OPTION) {
            state.validOptions.push({
              'entry': state.targetSlot.entry
            });
            if (state.validOptions.length > 0x1) {
              state.countThresholdReached = true;
              return;
            }
            state.subregionStack.stack.forEach(_0xefacfe => {
              if (!_0xefacfe.isFilled) {
                _0xefacfe.isFilled = true;
                _0xefacfe.recordValidFill();
              }
            });
          } else {
            if (state.mode === Mode.EVALUATE_SLOT_OPTIONS) {
              if (state.gridScore > state.maxGridScore) {
                state.maxGridScore = state.gridScore;
              }
              _0x470370 = {
                'value': ResumeAction.FIND_NEXT
              };
              state.numSolutions++;
              state.gridScore -= _0x3c88bc[_0x17512c].s || 0x0;
              if (_0x338fdb) {
                _0x338fdb.forEach(_0x26d470 => {
                  if (_0x26d470.slot.maxScore) {
                    state.gridScore -= _0x26d470.slot.wordInfo.s || 0x0;
                    state.maxRemainingScore += _0x26d470.slot.maxScore;
                  }
                });
              }
            }
          }
        }
      }
      rollbackFillActions(_0x14d33c, _0x55e846);
      const _0x5b6586 = 0x1 + (_0x338fdb ? _0x338fdb.length : 0x0);
      words.splice(-_0x5b6586, _0x5b6586);
      state.dependencyGraph.markUnfilled(_0x14d33c);
      if (_0x338fdb) {
        _0x338fdb.forEach(_0x5d05b2 => state.dependencyGraph.markUnfilled(_0x5d05b2.slot));
      }
      if (state.debug) {
        hideFill(_0x57a6bb, _0x14d33c);
      }
      if ((state.mode === Mode.FIND_SLOT_OPTIONS || state.mode === Mode.FIND_SINGLE_SLOT_OPTION) && state.targetSlot.isFilled) {
        if (_0x14d33c.subregionInfo) {
          state.subregionStack.pop();
        }
        state.searchLevel--;
        if (state.mode === Mode.FIND_SLOT_OPTIONS || state.mode === Mode.FIND_SINGLE_SLOT_OPTION) {
          state.searchTreeSlots[_0x14d33c.index] = 0x0;
        }
        state.dependencyGraph.clearDependencies(_0x14d33c);
        return {
          'condition': Condition.SLOT_IS_UNFILLED,
          'slot': state.targetSlot
        };
      }
      if (_0x470370 && _0x470370.value === ResumeAction.BACKTRACK) {
        if (_0x470370.backtrackSlot.isFilled) {
          state.searchLevel--;
          if (state.mode === Mode.FIND_SLOT_OPTIONS || state.mode === Mode.FIND_SINGLE_SLOT_OPTION) {
            state.searchTreeSlots[_0x14d33c.index] = 0x0;
          }
          state.dependencyGraph.clearDependencies(_0x14d33c);
          return {
            'condition': Condition.SLOT_IS_UNFILLED,
            'slot': _0x470370.backtrackSlot
          };
        }
      }
    } else {
      state.prevSlot = _0x14d33c;
      const _0x5af36e = await fillSlot();
      if (stopProcessing || state.countThresholdReached || state.timedOut) {
        return;
      }
      if (_0x14d33c.subregionInfo) {
        if (_0x14d33c.subregionInfo.isFilled) {
          _0x14d33c.subregionInfo.recordSearchedSubstring();
          const _0x31c245 = state.subregionStack.lastRegion;
          if (!_0x31c245.isPrefilled) {
            _0x31c245.isFilled = false;
            state.subregionStack.currentIndex = state.subregionStack.stack.length;
          }
        } else if (_0x5260ae && !_0x14d33c.subregionInfo.hasDupes) {
          _0x14d33c.subregionInfo.recordInvalidFill();
        }
        _0x14d33c.subregionInfo.hasDupes = false;
      }
      if (state.mode === Mode.EVALUATE_SLOT_OPTIONS) {
        state.gridScore -= _0x3c88bc[_0x17512c].s || 0x0;
        if (_0x338fdb) {
          _0x338fdb.forEach(_0x570656 => {
            if (_0x570656.slot.maxScore) {
              state.gridScore -= _0x570656.slot.wordInfo.s || 0x0;
              state.maxRemainingScore += _0x570656.slot.maxScore;
            }
          });
        }
      }
      rollbackFillActions(_0x14d33c, _0x55e846);
      const _0x23bd7c = 0x1 + (_0x338fdb ? _0x338fdb.length : 0x0);
      words.splice(-_0x23bd7c, _0x23bd7c);
      state.dependencyGraph.markUnfilled(_0x14d33c);
      if (_0x338fdb) {
        _0x338fdb.forEach(_0x259ad2 => state.dependencyGraph.markUnfilled(_0x259ad2.slot));
      }
      if (state.debug) {
        hideFill(_0x57a6bb, _0x14d33c);
      }
      if (_0x5af36e.condition === Condition.SLOT_INFLUENCES) {
        if (_0x5af36e.slot.region !== _0x14d33c.region && state.numSolutions > 0x0) {
          if (state.debug) {
            console.log("Backjumped to a new region with slot " + _0x14d33c.name + ". Resuming search");
          }
          state.currentFillRegion = _0x14d33c.region;
        } else {
          if (_0x5af36e.dupeSlots && _0x5af36e.dupeSlots.includes(_0x14d33c)) {
            if (state.debug) {
              console.log("Backjumped to slot " + _0x14d33c.name + " which duped another slot downstream. Resuming search");
            }
          } else {
            if (_0x5af36e.dupeSlots && _0x338fdb && _0x338fdb.some(_0x261d44 => _0x5af36e.dupeSlots.includes(_0x261d44.slot))) {
              if (state.debug) {
                console.log("Backjumped to slot " + _0x14d33c.name + " with crosser that duped another slot downstream. Resuming search");
              }
            } else {
              if ((state.mode === Mode.FIND_SLOT_OPTIONS || state.mode === Mode.FIND_SINGLE_SLOT_OPTION || state.numSolutions == 0x0) && !state.dependencyGraph.isDependent(_0x5af36e.slot, _0x14d33c)) {
                if (state.debug) {
                  console.log("Backjumping over " + _0x14d33c.name);
                }
                if (_0x14d33c.subregionInfo) {
                  state.subregionStack.pop();
                }
                if (state.mode === Mode.EVALUATE_SLOT_OPTIONS) {
                  state.maxRemainingScore += _0x14d33c.maxScore;
                }
                state.searchLevel--;
                if (state.mode === Mode.FIND_SLOT_OPTIONS || state.mode === Mode.FIND_SINGLE_SLOT_OPTION) {
                  state.searchTreeSlots[_0x14d33c.index] = 0x0;
                }
                state.dependencyGraph.clearDependencies(_0x14d33c);
                return _0x5af36e;
              } else {
                if (_0x5af36e.dupeSlots) {
                  if (!_0x1d646c) {
                    _0x1d646c = _0x5af36e.dupeSlots;
                  } else {
                    _0x5af36e.dupeSlots.forEach(_0x5d5cb0 => {
                      if (!_0x1d646c.includes(_0x5d5cb0)) {
                        _0x1d646c.push(_0x5d5cb0);
                      }
                    });
                  }
                }
              }
            }
          }
        }
      } else {
        if (_0x5af36e.condition === Condition.SLOT_IS_UNFILLED && _0x5af36e.slot.isFilled) {
          if (state.debug) {
            console.log("Backjumping over " + _0x14d33c.name);
          }
          if (_0x14d33c.subregionInfo) {
            state.subregionStack.pop();
          }
          state.searchLevel--;
          if (state.mode === Mode.FIND_SLOT_OPTIONS || state.mode === Mode.FIND_SINGLE_SLOT_OPTION) {
            state.searchTreeSlots[_0x14d33c.index] = 0x0;
          }
          state.dependencyGraph.clearDependencies(_0x14d33c);
          return _0x5af36e;
        }
      }
      if (_0x5af36e.condition === Condition.SLOT_INFLUENCES) {
        state.dependencyGraph.transferDependencies(_0x5af36e.slot, _0x14d33c);
      }
    }
  }
  if (state.debug) {
    console.log("Finished looking at candidates for " + _0x14d33c.wordNum + (_0x14d33c.dir === Direction.ACROSS ? 'A' : 'D') + '.');
  }
  if (_0x14d33c.subregionInfo) {
    state.subregionStack.pop();
  }
  if (state.mode === Mode.EVALUATE_SLOT_OPTIONS) {
    state.maxRemainingScore += _0x14d33c.maxScore;
  }
  if (state.mode === Mode.FULL_SOLUTION && state.searchLevel > state.deepestSearch.level) {
    state.deepestSearch.level = state.searchLevel;
    state.deepestSearch.slot = _0x14d33c;
  }
  state.searchLevel--;
  if (state.mode === Mode.FIND_SLOT_OPTIONS || state.mode === Mode.FIND_SINGLE_SLOT_OPTION) {
    state.searchTreeSlots[_0x14d33c.index] = 0x0;
  }
  return {
    'condition': Condition.SLOT_INFLUENCES,
    'slot': _0x14d33c,
    'dupeSlots': _0x1d646c
  };
}
function resortCandidates(_0x1893ed) {
  {
    const _0x32d286 = _0x1893ed.getCurrentCandidates();
    const _0x19ee71 = [];
    for (let _0x5f5d50 = 0x0; _0x5f5d50 < _0x1893ed.length; _0x5f5d50++) {
      if (_0x1893ed.chars[_0x5f5d50] || _0x1893ed.getFillChar(_0x5f5d50) !== undefined) {
        continue;
      }
      const _0xfd0953 = _0x1893ed.crossers[_0x5f5d50];
      if (!_0xfd0953) {
        continue;
      }
      _0x19ee71.push({
        'crosser': _0xfd0953,
        'slotIndex': _0x5f5d50,
        'crosserIndex': _0x1893ed.slotPos - _0xfd0953.startPos,
        'countCache': new Array(0x24)
      });
    }
    for (let _0x1ac5c6 = 0x0; _0x1ac5c6 < _0x32d286.length; _0x1ac5c6++) {
      _0x32d286[_0x1ac5c6].fs = 0x1;
      for (let _0x524058 = 0x0; _0x524058 < _0x19ee71.length; _0x524058++) {
        const _0x3a91df = _0x19ee71[_0x524058];
        const _0x490ced = _0x3a91df.crosser.getCurrentCandidates();
        const _0x3a5122 = _0x1893ed.getChar(_0x32d286[_0x1ac5c6].w, _0x3a91df.slotIndex);
        let _0x54aa6e;
        if (_0x490ced) {
          _0x54aa6e = _0x3a91df.countCache[Dictionary.getCharCode(_0x3a5122)];
          if (_0x54aa6e === undefined) {
            _0x54aa6e = _0x490ced.reduce((_0x7a4b79, _0x35ac79) => _0x7a4b79 + (_0x35ac79.w[_0x3a91df.crosserIndex] === _0x3a5122 ? 0x1 : 0x0), 0x0);
            _0x3a91df.countCache[Dictionary.getCharCode(_0x3a5122)] = _0x54aa6e;
          }
        } else {
          const _0x254d62 = dictionary.getProb(_0x3a5122, _0x3a91df.crosserIndex, _0x3a91df.crosser.length);
          _0x54aa6e = _0x254d62 * _0x3a91df.crosser.numCandidates;
        }
        _0x32d286[_0x1ac5c6].fs *= _0x54aa6e;
      }
    }
    _0x32d286.sort((_0x274da7, _0xa933f7) => {
      if (_0x274da7.fs === _0xa933f7.fs) {
        if (_0x274da7.s === _0xa933f7.s) {
          return _0x274da7.w.localeCompare(_0xa933f7.w);
        }
        return _0xa933f7.s - _0x274da7.s;
      }
      return _0xa933f7.fs - _0x274da7.fs;
    });
    _0x32d286.resorted = true;
  }
}
function purgeCandidates(_0x37987c, _0x172b00, _0x1aaa5f, _0x3cca00) {
  let _0x389e30 = _0x172b00;
  let _0x41230a = _0x1aaa5f;
  let _0x193f22;
  do {
    _0x193f22 = false;
    for (let _0x5a55ee = 0x0; _0x5a55ee < _0x389e30.length; _0x5a55ee++) {
      const _0x148f29 = _0x389e30[_0x5a55ee];
      if (_0x148f29.candidateStack.length === 0x0) {
        continue;
      }
      const _0x2d5ee2 = new Array(_0x148f29.length);
      for (let _0x4407fb = 0x0; _0x4407fb < _0x148f29.length; _0x4407fb++) {
        if (_0x148f29.chars[_0x4407fb]) {
          continue;
        }
        const _0x116b45 = _0x148f29.crossers[_0x4407fb];
        if (!_0x116b45 || !_0x41230a.includes(_0x116b45)) {
          continue;
        }
        const _0x3e3360 = _0x116b45.getCurrentCharOptions();
        if (_0x3e3360) {
          _0x2d5ee2[_0x4407fb] = _0x3e3360[_0x148f29.slotPos - _0x116b45.startPos];
        }
      }
      const _0x29ed59 = filterCandidates(_0x148f29, _0x2d5ee2);
      if (_0x29ed59.length === 0x0) {
        return _0x148f29;
      }
      if (_0x148f29.getCurrentCandidates().length - _0x29ed59.length > 0x0) {
        _0x148f29.candidateStack.push(_0x29ed59);
        _0x3cca00.push({
          'slot': _0x148f29,
          'type': FillAction.FILTERED_CANDS
        });
        state.dependencyGraph.addDependency(_0x37987c, _0x148f29);
        _0x148f29.findCurrentCharOptions();
        _0x193f22 = true;
      }
    }
    if (_0x389e30 === _0x172b00) {
      _0x389e30 = _0x1aaa5f;
      _0x41230a = _0x172b00;
    } else {
      _0x389e30 = _0x172b00;
      _0x41230a = _0x1aaa5f;
    }
  } while (_0x193f22);
}
function filterCandidates(_0x111559, _0x3ba0b9) {
  const _0x5b7d35 = _0x111559.getCurrentCandidates();
  const _0x1727a2 = [];
  _0x5b7d35.forEach(_0x3ed712 => {
    for (let _0x548c21 = 0x0; _0x548c21 < _0x3ba0b9.length; _0x548c21++) {
      if (!_0x3ba0b9[_0x548c21]) {
        continue;
      }
      if (!_0x3ba0b9[_0x548c21][Dictionary.getCharCode(_0x111559.getChar(_0x3ed712.w, _0x548c21))]) {
        return;
      }
    }
    _0x1727a2.push(_0x3ed712);
  });
  return _0x1727a2;
}
function addMaxDependencies(_0x17ebb0) {
  if (state.dependencyGraph.hasMaxDependencies(_0x17ebb0)) {
    return;
  }
  for (let _0xa3663f = 0x0; _0xa3663f < _0x17ebb0.length; _0xa3663f++) {
    if (_0x17ebb0.chars[_0xa3663f] || _0x17ebb0.getFillChar(_0xa3663f)) {
      continue;
    }
    const _0x58788f = _0x17ebb0.crossers[_0xa3663f];
    if (!_0x58788f) {
      continue;
    }
    for (let _0x37af96 = 0x0; _0x37af96 < _0x58788f.length; _0x37af96++) {
      if (_0x58788f.chars[_0x37af96] || _0x58788f.getFillChar(_0x37af96)) {
        continue;
      }
      const _0xd9c794 = _0x58788f.crossers[_0x37af96];
      if (_0xd9c794 && _0xd9c794 !== _0x17ebb0) {
        state.dependencyGraph.addDependency(_0x17ebb0, _0xd9c794);
      }
    }
  }
  state.dependencyGraph.recordMaxDependencies(_0x17ebb0);
}
function rollbackFillActions(_0x30bf7e, _0x5be765) {
  _0x5be765.forEach(_0x498ac3 => {
    if (_0x498ac3.type === FillAction.NEW_FILL_CHAR) {
      _0x498ac3.slot.popFillChar();
    } else {
      if (_0x498ac3.type === FillAction.FILTERED_CANDS) {
        _0x498ac3.slot.candidateStack.pop();
      }
    }
  });
  return _0x30bf7e.fillCharStack.pop();
}
function isSlotOptionSearch() {
  return state.mode === Mode.FIND_SLOT_OPTIONS || state.mode === Mode.FIND_SINGLE_SLOT_OPTION;
}
function isPuzzleFilled() {
  if (state.mode === Mode.EVALUATE_SLOT_OPTIONS) {
    return !state.neighboringSlots.some(_0x5a87d7 => !_0x5a87d7.isFilled);
  }
  for (let _0x107772 = 0x0; _0x107772 < slotList.length; _0x107772++) {
    if (state.fillRegion && slotList[_0x107772].region !== state.fillRegion) {
      continue;
    }
    if (!slotList[_0x107772].isFilled) {
      return false;
    }
  }
  return true;
}
function displayFill(_0x3a575a, _0x55cb08) {
  const _0x2e03c0 = [];
  for (let _0x484a9a = 0x0; _0x484a9a < _0x55cb08.length; _0x484a9a++) {
    if (_0x3a575a.chars[_0x484a9a] === undefined) {
      continue;
    }
    const _0x2e4949 = _0x55cb08.dir === Direction.ACROSS ? _0x55cb08.slotPos : _0x55cb08.startPos + _0x484a9a;
    const _0x5443cd = _0x55cb08.dir === Direction.ACROSS ? _0x55cb08.startPos + _0x484a9a : _0x55cb08.slotPos;
    _0x2e03c0.push({
      'rowNum': _0x2e4949,
      'colNum': _0x5443cd,
      'char': _0x3a575a.chars[_0x484a9a]
    });
    postMessage({
      'type': "fillEvent",
      'name': 'displayFill',
      'fillChars': _0x2e03c0
    });
  }
}
function hideFill(_0x4afb4f, _0x261a07) {
  const _0x496fd0 = [];
  for (let _0x573ab1 = 0x0; _0x573ab1 < _0x261a07.length; _0x573ab1++) {
    if (_0x4afb4f.chars[_0x573ab1] === undefined) {
      continue;
    }
    const _0x116c94 = _0x261a07.dir === Direction.ACROSS ? _0x261a07.slotPos : _0x261a07.startPos + _0x573ab1;
    const _0xefd363 = _0x261a07.dir === Direction.ACROSS ? _0x261a07.startPos + _0x573ab1 : _0x261a07.slotPos;
    _0x496fd0.push({
      'rowNum': _0x116c94,
      'colNum': _0xefd363
    });
    postMessage({
      'type': 'fillEvent',
      'name': "hideFill",
      'fillChars': _0x496fd0
    });
  }
}
function getSolution() {
  const _0x5e055e = new Array(grid.size.height);
  for (let _0x210ab3 = 0x0; _0x210ab3 < grid.size.height; _0x210ab3++) {
    _0x5e055e[_0x210ab3] = new Array(grid.size.width);
  }
  slotList.forEach(_0x2d886a => {
    if (_0x2d886a.dir === Direction.DOWN && !_0x2d886a.isUnchecked) {
      return;
    }
    for (let _0x517beb = 0x0; _0x517beb < _0x2d886a.length; _0x517beb++) {
      const _0x5dc03a = _0x2d886a.getFillChar(_0x517beb);
      if (_0x5dc03a) {
        const {
          irow: _0x4048b8,
          icol: _0x4b4d70
        } = _0x2d886a.getGridCoords(_0x517beb);
        _0x5e055e[_0x4048b8][_0x4b4d70] = _0x5dc03a;
      }
    }
  });
  const _0x19e2ad = words.filter(_0x2a3ad3 => _0x2a3ad3.entry.isFill).map(_0x23f5f4 => _0x23f5f4.entry);
  _0x19e2ad.sort((_0x3aec25, _0x498522) => {
    return _0x3aec25.dir === _0x498522.dir ? _0x3aec25.num - _0x498522.num : _0x3aec25.dir - _0x498522.dir;
  });
  return {
    'fillChars': _0x5e055e,
    'fillEntries': _0x19e2ad
  };
}
function isDupeSolution(_0x2e3bd7) {
  _0x4d3a1e: for (let _0x32aea4 = 0x0; _0x32aea4 < state.sols.length; _0x32aea4++) {
    const _0x30340f = state.sols[_0x32aea4].fillEntries;
    for (let _0x50d123 = 0x0; _0x50d123 < _0x2e3bd7.length; _0x50d123++) {
      if (_0x2e3bd7[_0x50d123].w !== _0x30340f[_0x50d123].w) {
        continue _0x4d3a1e;
      }
    }
    return true;
  }
  return false;
}
function showSolution(_0x3e150b) {
  return new Promise(_0x32eeb0 => {
    emitFoundFillEvent(_0x3e150b);
    state.paused = true;
    const _0x2e37a1 = function (_0x4a2a72) {
      state.paused = false;
      if (_0x4a2a72.backtrackSlot) {
        _0x32eeb0({
          'value': ResumeAction.BACKTRACK,
          'backtrackSlot': _0x4a2a72.backtrackSlot
        });
      } else {
        _0x32eeb0({
          'value': ResumeAction.FIND_NEXT
        });
      }
      self.removeEventListener("terminateSearch", _0x76af89);
    };
    const _0x76af89 = function () {
      state.paused = false;
      stopProcessing = true;
      _0x32eeb0({
        'value': ResumeAction.END_SEARCH
      });
      self.removeEventListener('resumeSearch', _0x2e37a1);
    };
    self.addEventListener('resumeSearch', _0x2e37a1, {
      'once': true
    });
    self.addEventListener("terminateSearch", _0x76af89, {
      'once': true
    });
  });
}
function emitFoundFillEvent(_0x596b9e) {
  const _0x2d1913 = Date.now() - state.startTime;
  state.searchTime += _0x2d1913;
  const _0x24576c = words.map(_0x52e039 => _0x52e039.entry);
  _0x24576c.sort(byGridPos);
  postMessage({
    'type': "fillEvent",
    'name': "foundFill",
    'fillChars': _0x596b9e,
    'countMode': state.countMode,
    'solIndex': state.sols.length - 0x1,
    'numSolutions': state.numSolutions,
    'searchTime': _0x2d1913,
    'words': _0x24576c
  });
}
function determineNextFillSlot() {
  if (state.mode === Mode.FIND_SLOT_OPTIONS || state.mode === Mode.FIND_SINGLE_SLOT_OPTION) {
    if (state.searchLevel === 0x0 && state.targetSlot && state.targetSlot.hasIncludeWordFilter) {}
    if (state.searchLevel === 0x0 && state.phaseType === SearchPhase.PER_CANDIDATE) {
      return state.targetSlot;
    }
    const _0x841f8f = getMostConstrainedSlot(state.nonSubregionSlots);
    if (_0x841f8f && _0x841f8f.candidateStack.length > 0x0) {
      return _0x841f8f;
    }
    return getMostConstrainedSlot(state.subregionSlots);
  } else {
    let _0x535da1 = getMostConstrainedSlot(state.currentFillRegion ? regionSlots[state.currentFillRegion - 0x1] : slotList);
    if (!state.currentFillRegion) {
      state.currentFillRegion = _0x535da1.region;
    }
    if (_0x535da1) {
      return _0x535da1;
    }
    _0x535da1 = getMostConstrainedSlot(slotList);
    state.currentFillRegion = _0x535da1.region;
    return _0x535da1;
  }
}
function getMostConstrainedSlot(_0x4e1208) {
  let _0x560d73;
  const _0xe7c966 = state.searchLevel === 0x0 && state.phaseType === SearchPhase.GLOBAL && state.pass > 0x0 || state.searchLevel === 0x1 && state.phaseType === SearchPhase.PER_CANDIDATE && state.pass > 0x1 ? [] : null;
  for (let _0x210281 = 0x0; _0x210281 < _0x4e1208.length; _0x210281++) {
    if (_0x4e1208[_0x210281].length <= 0x2 || _0x4e1208[_0x210281].isFilled) {
      continue;
    }
    if (_0x4e1208[_0x210281].candidateStack.length === 0x0) {
      continue;
    }
    if (_0xe7c966) {
      _0xe7c966.push(_0x4e1208[_0x210281]);
      continue;
    }
    if (!_0x560d73 || _0x4e1208[_0x210281].numCandidates < _0x560d73.numCandidates) {
      _0x560d73 = _0x4e1208[_0x210281];
    } else {
      if (_0x560d73.numCandidates === _0x4e1208[_0x210281].numCandidates && _0x4e1208[_0x210281].numConstraints > _0x560d73.numConstraints) {
        _0x560d73 = _0x4e1208[_0x210281];
      }
    }
  }
  if (_0xe7c966) {
    _0xe7c966.sort((_0x36f6da, _0x135ada) => {
      if (_0x36f6da.numCandidates === _0x135ada.numCandidates) {
        return _0x135ada.numConstraints - _0x36f6da.numConstraints;
      } else {
        return _0x36f6da.numCandidates - _0x135ada.numCandidates;
      }
    });
    if (state.phaseType === SearchPhase.GLOBAL) {
      return _0xe7c966[state.pass % _0xe7c966.length];
    } else {
      return _0xe7c966[(state.pass - 0x1) % _0xe7c966.length];
    }
  }
  return _0x560d73;
}
async function initializeFillLib() {
  Slot.dictionary = dictionary;
  Slot.excludeWords = globalFilters.excludeWords;
  postFillEvents = self.name === 'FillWorker';
  maxSlotOptions = (await App.getValue("maxSlotOptions")) || 0x12c;
}
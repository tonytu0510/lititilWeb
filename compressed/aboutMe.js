/**
 * @file aboutMe.js
 * @generated 2026-10-17T05:27:47.205Z
 * @note 普通脚本版（IIFE），可通过 <script src="./aboutMe.js"></script> 直接引用
 */
(function (global) {
  "use strict";

  var __RAW_B64__ = "CfaZcYOV17/uxuk+EWiJMbOW64sQag7o+KiWI3lfQEgejJFUkHvpctLMaOLM68LFn1yI4t9qZi0VsnthAR9oP/ernmKl6wKQXwDiUp45ST/rUUdmO3OGfN8y1u+7GKzEKd7pKW2H2VyIkw6WH1YdI5mJR9rIKdzjy2QigOKCdgx9bN7cwVxcPJx18lNFop5S/4QXGE3M1/TOr1Upi4UPUCYA3ZitXLoNbKf7531j11iEbbe6Ftfam/yCyL6SHklRThFzsILRVd2RWXlXHS+gH8rCFEbCQucGndNrdR1WcDZSXMCmETu9f26TbmFIsGF1eaIpPsRjIizVmv18wjr6rMa/tZ0R7XZa6zHP++Bu/ZseWNBWUP58VGrFsxK2uoe3zvUhFc1h5p94b05v4a4ne1melNr2LkxYu21K42D76gR7N/VimvYsjWUuyVz3to0agSAc9SWUg67OxmgstzO6Co+Vv4NmKKRpmP5rTuxD8uN8A8zRCayvkPnwB6IzI/Lno/zcSp54/QiHKFHR+bUJ1qc24xh5K7c5l5pTI0PRWN4C4zG4Jcybk+8wMalQ45MM9mnT2pC4p1nzoGWZFmFtZ2G2NokdVncFOzDc02b90estp/+q6Siesy8qAh33swBSNCI83gc8AHjWwLBM0xTUQkIQWC2sOeGQEw4ynpqrLuVQP1ZHIxS8pU24QwAc0rBQpwMZ0WwNf9qQDk3mOtKjH5oCvDf//tw8RAZR9R3P3URcagnDKdI7+FGTS0m4zSnq8rzXExf34UPO3hBDFHsUu/1ZbqejSO6HNhrcHUXtocHuSHjaSiQyUmOPwEGml/VVctY44h0gIOPTk73UC9s/ZT/d1mx6UYh4Dya0tRp8fKeZ83ck68TE76ABlE4TX7LGabKhN1RBP3cE/tGUf+88Ij5faXZSXbcNLjIFH4a+/1tjG2ffGxYlQRBh9LkI0kqBe2liXg+E236iobXA1s/nS2gXr4IVF9xmHelVbP9xSgMPAwaRk70qZ0QHK5yXGyySxkwTD3NTCvKqLjUZzQ+s+n9JvmIo2tft3a9ZBmVlSLzmtDdEAzKlDq+tTnSl9I/o8A365tcBZH/QoI+7q9MUsr3ZvKC4yedPinQ/RAWC4oVXMqSxL7oMNiCTVxenenQEwj2wMy7sHui+MjgwWDZC6KZiFxPXBGjm2rc=";
  var __BYTE_LENGTH__ = 890;

  function decodeBytes(b64) {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(b64, 'base64');
    }
    var bin = atob(b64);
    var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }

  var rawBytes = decodeBytes(__RAW_B64__);

  var AboutMe = {
    name: "aboutMe",
    version: 1,
    byteLength: __BYTE_LENGTH__,
    rawBytes: rawBytes,
    rawBase64: __RAW_B64__
  };

  global.AboutMe = AboutMe;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AboutMe;   // 兼容 Node require
  }
})(typeof window !== 'undefined' ? window : globalThis);

// ===== 生成：文本 → Base64 =====
const text = "https://example.com";
const qrCanvas = document.createElement('canvas');
// ... 在canvas上绘制二维码 ...
const base64 = qrCanvas.toDataURL('image/png');
// 结果：data:image/png;base64,iVBORw0KGgo...
// 内部自动完成了：像素 → PNG压缩 → Base64编码

// ===== 扫描：Base64 → 文本 =====
const img = new Image();
img.onload = () => {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // 内部自动完成了：Base64解码 → PNG解压 → 像素数组
  
  const code = jsQR(imageData.data, canvas.width, canvas.height);
  console.log(code.data); // "https://example.com"
};
img.src = base64;  // 直接用Base64作为图片源
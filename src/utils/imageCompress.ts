const MAX_IMAGE_SIZE = 150 * 1024; // 150KB（后端限制 280KB，留足余量）
const MAX_DIMENSION = 800;
const MIN_DIMENSION = 400;
const MIN_QUALITY = 0.2;

export async function compressImage(file: File | string): Promise<string> {
  let dataUrl: string;

  if (typeof file === 'string') {
    if (file.startsWith('data:')) {
      dataUrl = file;
    } else {
      return file;
    }
  } else {
    dataUrl = await fileToDataUrl(file);
  }

  const img = await loadImage(dataUrl);
  let width = img.width;
  let height = img.height;

  // 缩放到最大尺寸
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    if (width > height) {
      height = Math.round(height * (MAX_DIMENSION / width));
      width = MAX_DIMENSION;
    } else {
      width = Math.round(width * (MAX_DIMENSION / height));
      height = MAX_DIMENSION;
    }
  }

  let canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  let ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.8;
  let result = canvas.toDataURL('image/jpeg', quality);

  // 阶段一：降低质量
  while (estimateBase64Size(result) > MAX_IMAGE_SIZE && quality > MIN_QUALITY) {
    quality -= 0.1;
    result = canvas.toDataURL('image/jpeg', quality);
  }

  // 阶段二：如果仍超限，缩小尺寸再压缩
  while (estimateBase64Size(result) > MAX_IMAGE_SIZE && width > MIN_DIMENSION && height > MIN_DIMENSION) {
    width = Math.round(width * 0.7);
    height = Math.round(height * 0.7);
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, width, height);
    result = canvas.toDataURL('image/jpeg', quality);
  }

  return result;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function estimateBase64Size(base64: string): number {
  const padding = (base64.match(/=*$/) || [''])[0].length;
  const base64Length = base64.length - base64.indexOf(',') - 1;
  return Math.floor(base64Length * 3 / 4) - padding;
}

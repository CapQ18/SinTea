const MAX_IMAGE_SIZE = 200 * 1024;
const MAX_DIMENSION = 800;

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

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    if (width > height) {
      height = Math.round(height * (MAX_DIMENSION / width));
      width = MAX_DIMENSION;
    } else {
      width = Math.round(width * (MAX_DIMENSION / height));
      height = MAX_DIMENSION;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.8;
  let result = canvas.toDataURL('image/jpeg', quality);

  while (estimateBase64Size(result) > MAX_IMAGE_SIZE && quality > 0.3) {
    quality -= 0.1;
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

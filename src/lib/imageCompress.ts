const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.82

/** 긴 변 1600px 이하로 리사이즈하고 JPEG(품질 0.82)로 압축한다. */
export async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('캔버스를 생성할 수 없습니다.')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('이미지 압축에 실패했습니다.'))),
      'image/jpeg',
      JPEG_QUALITY,
    )
  })

  const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  return new File([blob], newName, { type: 'image/jpeg' })
}

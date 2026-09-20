import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import type { ImageStore, UploadParams, UploadResult } from '../lib/imageStore'
import { storage } from './config'

export class FirebaseImageStore implements ImageStore {
  async upload({ cid, pid, missionId, file, onProgress }: UploadParams): Promise<UploadResult> {
    const path = `challenges/${cid}/submissions/${pid}/${missionId}/${crypto.randomUUID()}.jpg`
    const storageRef = ref(storage, path)
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type })

    await new Promise<void>((resolve, reject) => {
      task.on(
        'state_changed',
        (snapshot) => onProgress?.(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
        reject,
        () => resolve(),
      )
    })

    const url = await getDownloadURL(storageRef)
    return { path, url }
  }

  async remove(path: string): Promise<void> {
    await deleteObject(ref(storage, path)).catch(() => {
      // 이미 삭제되었거나 존재하지 않는 파일은 무시한다.
    })
  }
}

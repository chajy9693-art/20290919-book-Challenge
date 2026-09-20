import { type User, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { auth } from './config'

let readyPromise: Promise<User> | null = null

/** 로그인 UI 없이 백그라운드에서 익명 인증을 보장한다. Firestore/Storage 쓰기 권한에 필요하다. */
export function ensureAnonymousAuth(): Promise<User> {
  if (!readyPromise) {
    readyPromise = new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            unsubscribe()
            resolve(user)
          }
        },
        reject,
      )
      signInAnonymously(auth).catch(reject)
    })
  }
  return readyPromise
}

import qiniu from 'qiniu'
import { config } from './index.js'

const { accessKey, secretKey, bucket, domain } = config.qiniu

const mac = accessKey && secretKey ? new qiniu.auth.digest.Mac(accessKey, secretKey) : null

/** Generate an upload token for Qiniu OSS (client-side upload) */
export function getUploadToken(key?: string): string | null {
  if (!mac || !bucket) return null
  const putPolicy = new qiniu.rs.PutPolicy({
    scope: key ? `${bucket}:${key}` : bucket,
    expires: 7200,
  })
  return putPolicy.uploadToken(mac)
}

/** Upload a local file buffer to Qiniu OSS */
export function uploadToQiniu(key: string, buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!mac || !bucket) return reject(new Error('Qiniu not configured'))

    const formUploader = new qiniu.form_up.FormUploader(
      new qiniu.conf.Config({ useCdnDomain: true }),
    )
    const putExtra = new qiniu.form_up.PutExtra()

    const token = getUploadToken(key)
    if (!token) return reject(new Error('Failed to generate upload token'))

    formUploader.put(token, key, buffer, putExtra, (err, body, info) => {
      if (err) return reject(err)
      if (info.statusCode === 200) {
        resolve(`${domain}/${body.key}`)
      } else {
        reject(new Error(`Upload failed: ${info.statusCode}`))
      }
    })
  })
}

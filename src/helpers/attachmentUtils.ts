import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})
// TODO: Implement the fileStogare logic
export class AttachmentUtils {

    constructor(
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
        ) {
    }
  
    async generatePreSignedUrl(todoId: string, userId: string): Promise<String> {
        console.log('Generating Image presigned URL for ', todoId, userId)
        return s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: `images/${todoId}`,
            Expires: parseInt(this.urlExpiration)
        })
    }

  }


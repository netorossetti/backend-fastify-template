// test/repositories/in-memory-uploader.ts
import { Uploader, UploadParams } from "@core/lib/uploader/uploader";

export class FakerUploader implements Uploader {
  uploaded: UploadParams[] = [];

  async upload(params: UploadParams): Promise<string> {
    this.uploaded.push(params);
    return `/uploads/${params.folder ?? "default"}/${params.fileName}`;
  }
}

/**
 * Backwards-compatible dropzone wrapper around the FilePicker.
 *
 * `FileUpload` keeps the original dropzone API; use `FilePicker` directly for
 * the button, compact, tile and avatar variants.
 */
import { FilePicker, type FilePickerProps } from './file-picker'

export type FileUploadProps = Omit<FilePickerProps, 'variant'>

export function FileUpload({ className, ...props }: FileUploadProps) {
  return <FilePicker {...props} variant="dropzone" className={className} />
}

/** Familiar alias for the file picker / upload surface. */
export { FilePicker } from './file-picker'
export type { FilePickerProps } from './file-picker'

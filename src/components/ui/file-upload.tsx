import { FileUp, X } from 'lucide-react'
import type { ChangeEvent, DragEvent } from 'react'
import { useEffect, useRef, useState } from 'react'

import { cx } from '~/lib/cx'
import type { FileValidationOptions } from '~/lib/security'
import { validateFile } from '~/lib/security'

import { Button } from './button'
import styles from './file-upload.module.scss'

type Preview = { file: File; url: string | null }

const DEFAULT_MAX = 10 * 1024 * 1024

export interface FileUploadProps {
  accept?: string[]
  maxBytes?: number
  maxFiles?: number
  maxImageDimension?: number
  onFiles?: (files: File[]) => void
  label?: string
  hint?: string
  disabled?: boolean
  className?: string
}

export function FileUpload({
  accept,
  maxBytes = DEFAULT_MAX,
  maxFiles = 4,
  maxImageDimension = 8192,
  onFiles,
  label = 'Upload files',
  hint,
  disabled = false,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<Preview[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const generation = useRef(0)
  const previewsRef = useRef<Preview[]>([])

  useEffect(() => {
    previewsRef.current = previews
  }, [previews])

  useEffect(
    () => () => {
      generation.current += 1
      for (const preview of previewsRef.current) {
        if (preview.url) URL.revokeObjectURL(preview.url)
      }
      previewsRef.current = []
    },
    [],
  )

  const process = async (list: FileList | File[]) => {
    const incoming = Array.from(list)
    const run = ++generation.current
    const nextErrors: string[] = []
    const accepted: File[] = []
    const slots = Math.max(0, maxFiles - previewsRef.current.length)
    const options: FileValidationOptions = {
      accept,
      maxBytes,
      maxImageDimension,
    }

    if (slots === 0) {
      setErrors([`Only ${maxFiles} files allowed.`])
      return
    }

    for (const file of incoming.slice(0, slots)) {
      const result = await validateFile(file, options)
      if (run !== generation.current) return
      if (result.ok) accepted.push(file)
      else nextErrors.push(`${file.name}: ${result.reason}`)
    }
    if (incoming.length > slots) {
      nextErrors.push(`Only ${maxFiles} files allowed.`)
    }
    if (run !== generation.current) return

    setErrors(nextErrors)
    if (!accepted.length) return

    const additions: Preview[] = accepted.map((file) => ({
      file,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }))
    setPreviews((prev) => [...prev, ...additions].slice(0, maxFiles))
    onFiles?.(accepted)
  }

  const remove = (index: number) => {
    setPreviews((prev) => {
      const target = prev[index]
      if (target?.url) URL.revokeObjectURL(target.url)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    if (!disabled) void process(event.dataTransfer.files)
  }

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) void process(event.target.files)
    event.target.value = ''
  }

  return (
    <div className={cx(styles.root, className)}>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cx(
          styles.dropzone,
          dragging && styles.dragging,
          disabled && styles.disabled,
        )}
      >
        <FileUp className={styles.icon} aria-hidden />
        <p className={styles.title}>{label}</p>
        <p className={styles.hint}>
          {hint ??
            `Drag and drop or choose files. Up to ${maxFiles}, ${Math.round(maxBytes / 1024 / 1024)} MB each.`}
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className={styles.choose}
        >
          Choose files
        </Button>
        <input
          ref={inputRef}
          type="file"
          aria-label={label}
          multiple={maxFiles > 1}
          accept={accept?.join(',')}
          disabled={disabled}
          onChange={handleInput}
          className={styles.srOnly}
        />
      </div>

      {previews.length ? (
        <ul className={styles.previews} aria-label="Selected files">
          {previews.map((preview, index) => (
            <li key={`${preview.file.name}-${index}`} className={styles.preview}>
              {preview.url ? (
                <img
                  src={preview.url}
                  alt=""
                  className={styles.thumbImage}
                  loading="lazy"
                />
              ) : (
                <span className={styles.thumbFallback}>
                  {preview.file.name.split('.').pop()?.slice(0, 4) ?? 'file'}
                </span>
              )}
              <span className={styles.meta}>
                <span className={styles.name}>{preview.file.name}</span>
                <span className={styles.size}>
                  {(preview.file.size / 1024).toFixed(0)} KB
                </span>
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`Remove ${preview.file.name}`}
                className={styles.remove}
              >
                <X className={styles.removeIcon} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {errors.length ? (
        <ul role="alert" className={styles.errors}>
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/** Familiar alias for the file picker / upload surface. */
export { FileUpload as FilePicker }

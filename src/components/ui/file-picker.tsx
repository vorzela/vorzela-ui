import { Camera, FileUp, Plus, X } from 'lucide-react'
import type { ChangeEvent, DragEvent, ReactNode } from 'react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { cx } from '~/lib/cx'
import type { FileValidationOptions, FileValidationResult } from '~/lib/security'
import { validateFile } from '~/lib/security'

import { Button } from './button'
import styles from './file-picker.module.scss'

export type FilePickerVariant = 'dropzone' | 'button' | 'compact' | 'avatar' | 'tile'

export type FileRejection = {
  file: File
  reason: string
}

export interface FilePickerProps {
  /** Visual treatment. */
  variant?: FilePickerVariant
  /** MIME types or extensions, e.g. ["image/*", ".pdf"]. */
  accept?: string[]
  /** Per-file size ceiling in bytes. */
  maxBytes?: number
  /** Per-file size floor in bytes. */
  minBytes?: number
  /** Total size ceiling across all selected files. */
  maxTotalBytes?: number
  /** Maximum selected files. Avatar defaults to one. */
  maxFiles?: number
  /** Minimum selected files. Shown as a validation hint. */
  minFiles?: number
  /** Maximum image width/height in pixels. */
  maxImageDimension?: number
  /** Minimum image width/height in pixels. */
  minImageDimension?: number
  /** Force multi-select. Defaults to `maxFiles > 1`. */
  multiple?: boolean
  /** Mobile camera hint for image capture. */
  capture?: 'user' | 'environment'
  /** Ask the browser for a directory picker where supported. */
  directory?: boolean
  disabled?: boolean
  label?: string
  hint?: ReactNode
  buttonLabel?: string
  className?: string
  id?: string
  name?: string
  /** Controlled file list. Omit for uncontrolled use. */
  files?: File[]
  /** Initial files for uncontrolled use. */
  defaultFiles?: File[]
  /** Show the file rows under the picker. */
  showPreviewList?: boolean
  onFiles?: (files: File[]) => void
  onFilesChange?: (files: File[]) => void
  onReject?: (rejections: FileRejection[]) => void
  onRemove?: (file: File) => void
}

const DEFAULT_MAX = 10 * 1024 * 1024

const REASON: Record<
  Extract<FileValidationResult, { ok: false }>['reason'],
  string
> = {
  empty: 'the file is empty',
  type: 'this file type is not allowed',
  size: 'the file is too large',
  'min-size': 'the file is too small',
  dimensions: 'the image dimensions are too large',
  'min-dimensions': 'the image dimensions are too small',
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function acceptLabel(accept?: string[]): string | null {
  if (!accept?.length) return null
  return accept
    .map((rule) => {
      const value = rule.toLowerCase()
      if (value === 'image/*') return 'images'
      if (value === 'video/*') return 'videos'
      if (value === 'audio/*') return 'audio'
      if (value.startsWith('.')) return value.slice(1).toUpperCase()
      return value.split('/')[1]?.toUpperCase() ?? value
    })
    .join(', ')
}

type InputFile = HTMLInputElement & { webkitdirectory: boolean }

export function FilePicker({
  variant = 'dropzone',
  accept,
  maxBytes = DEFAULT_MAX,
  minBytes,
  maxTotalBytes,
  maxFiles = 4,
  minFiles,
  maxImageDimension = 8192,
  minImageDimension,
  multiple,
  capture,
  directory = false,
  disabled = false,
  label = 'Upload files',
  hint,
  buttonLabel = 'Choose files',
  className,
  id,
  name,
  files,
  defaultFiles = [],
  showPreviewList = true,
  onFiles,
  onFilesChange,
  onReject,
  onRemove,
}: FilePickerProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const inputRef = useRef<InputFile>(null)
  const [internal, setInternal] = useState<File[]>(defaultFiles)
  const [errors, setErrors] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)

  const selected = files ?? internal
  const single = variant === 'avatar'
  const limit = single ? 1 : Math.max(1, maxFiles)
  const allowMultiple = multiple ?? limit > 1
  const isDropzone = variant === 'dropzone'
  const isTile = variant === 'tile'
  const hasValue = selected.length > 0

  const previews = useMemo(
    () =>
      selected.map((file) => ({
        file,
        url:
          typeof URL !== 'undefined' && file.type.startsWith('image/')
            ? URL.createObjectURL(file)
            : null,
      })),
    [selected],
  )

  useEffect(
    () => () => {
      for (const preview of previews) {
        if (preview.url) URL.revokeObjectURL(preview.url)
      }
    },
    [previews],
  )

  useEffect(() => {
    if (inputRef.current) inputRef.current.webkitdirectory = directory
  }, [directory])

  const setSelection = (next: File[]) => {
    if (files === undefined) setInternal(next)
    onFilesChange?.(next)
  }

  const process = async (list: FileList | File[]) => {
    const incoming = Array.from(list)
    const nextErrors: string[] = []
    const rejections: FileRejection[] = []
    const slots = Math.max(0, limit - selected.length)
    const options: FileValidationOptions = {
      accept,
      maxBytes,
      minBytes,
      maxImageDimension,
      minImageDimension,
    }

    if (slots === 0) {
      setErrors([`Only ${limit} ${limit === 1 ? 'file is' : 'files are'} allowed.`])
      return
    }

    const accepted: File[] = []
    for (const file of incoming.slice(0, slots)) {
      const result = await validateFile(file, options)
      if (result.ok) accepted.push(file)
      else {
        const reason = REASON[result.reason]
        nextErrors.push(`${file.name}: ${reason}.`)
        rejections.push({ file, reason })
      }
    }

    let next = [...selected, ...accepted]
    if (maxTotalBytes != null) {
      let total = selected.reduce((sum, file) => sum + file.size, 0)
      next = [...selected]
      for (const file of accepted) {
        if (total + file.size > maxTotalBytes) {
          const reason = `the total upload must stay under ${formatBytes(maxTotalBytes)}`
          nextErrors.push(`${file.name}: ${reason}.`)
          rejections.push({ file, reason })
        } else {
          total += file.size
          next.push(file)
        }
      }
    }

    if (incoming.length > slots) {
      nextErrors.push(`Only ${limit} ${limit === 1 ? 'file is' : 'files are'} allowed.`)
    }
    if (minFiles != null && next.length > 0 && next.length < minFiles) {
      nextErrors.push(`Select at least ${minFiles} files.`)
    }

    setErrors(nextErrors)
    onReject?.(rejections)
    if (next.length === selected.length) return

    setSelection(next)
    onFiles?.(next.slice(selected.length))
  }

  const remove = (file: File) => {
    const next = selected.filter((item) => item !== file)
    setSelection(next)
    onRemove?.(file)
    if (minFiles != null && next.length > 0 && next.length < minFiles) {
      setErrors([`Select at least ${minFiles} files.`])
    } else {
      setErrors([])
    }
  }

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    setDragging(false)
    if (!disabled) void process(event.dataTransfer.files)
  }

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) void process(event.target.files)
    event.target.value = ''
  }

  const typeLabel = acceptLabel(accept)
  const limits = [
    `Up to ${limit} ${limit === 1 ? 'file' : 'files'}`,
    `${formatBytes(maxBytes)} each`,
    maxTotalBytes != null ? `${formatBytes(maxTotalBytes)} total` : null,
    typeLabel ? typeLabel.toLowerCase() : null,
    minBytes != null ? `at least ${formatBytes(minBytes)}` : null,
    minFiles != null ? `minimum ${minFiles} selected` : null,
  ].filter(Boolean)

  const open = () => inputRef.current?.click()

  const input = (
    <input
      ref={inputRef}
      id={inputId}
      name={name}
      type="file"
      aria-label={label}
      accept={accept?.join(',')}
      capture={capture}
      multiple={!single && allowMultiple}
      disabled={disabled}
      onChange={handleInput}
      className={styles.srOnly}
    />
  )

  const fileList = showPreviewList && !single && !isTile && selected.length > 0 ? (
    <ul className={styles.previews} aria-label="Selected files">
      {previews.map((preview) => (
        <li key={`${preview.file.name}-${preview.file.lastModified}`} className={styles.preview}>
          {preview.url ? (
            <img src={preview.url} alt="" className={styles.thumbImage} loading="lazy" />
          ) : (
            <span className={styles.thumbFallback}>
              {preview.file.name.split('.').pop()?.slice(0, 4) ?? 'file'}
            </span>
          )}
          <span className={styles.meta}>
            <span className={styles.name}>{preview.file.name}</span>
            <span className={styles.size}>{formatBytes(preview.file.size)}</span>
          </span>
          <button
            type="button"
            onClick={() => remove(preview.file)}
            aria-label={`Remove ${preview.file.name}`}
            className={styles.remove}
          >
            <X className={styles.removeIcon} aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  ) : null

  const errorsList = errors.length > 0 ? (
    <ul role="alert" className={styles.errors}>
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  ) : null

  if (variant === 'avatar') {
    const preview = previews[0]
    return (
      <div className={cx(styles.root, className)}>
        <button
          type="button"
          onClick={open}
          disabled={disabled}
          className={cx(styles.avatar, disabled && styles.avatarDisabled)}
          aria-describedby={hint ? `${inputId}-hint` : undefined}
        >
          {preview?.url ? (
            <img src={preview.url} alt="" className={styles.avatarImage} />
          ) : (
            <span className={styles.avatarPlaceholder}>
              <Camera aria-hidden size={20} />
              {label}
            </span>
          )}
          {hasValue ? (
            <span className={styles.avatarOverlay}>
              <Camera aria-hidden size={12} />
              Change
            </span>
          ) : null}
        </button>
        {hint ? <p id={`${inputId}-hint`} className={styles.hint}>{hint}</p> : null}
        {input}
        {errorsList}
      </div>
    )
  }

  if (isTile) {
    return (
      <div className={cx(styles.root, className)}>
        <div className={styles.tileGrid} role="group" aria-label={label}>
          {previews.map((preview) => (
            <div key={`${preview.file.name}-${preview.file.lastModified}`} className={styles.tile}>
              {preview.url ? (
                <img src={preview.url} alt="" className={styles.tileImage} loading="lazy" />
              ) : (
                <span className={styles.tileCaption}>{preview.file.name}</span>
              )}
              <button
                type="button"
                onClick={() => remove(preview.file)}
                aria-label={`Remove ${preview.file.name}`}
                className={styles.tileRemove}
              >
                <X className={styles.tileRemoveIcon} aria-hidden />
              </button>
            </div>
          ))}
          {selected.length < limit ? (
            <button
              type="button"
              onClick={open}
              disabled={disabled}
              className={styles.tile}
              aria-label={buttonLabel}
            >
              <span className={styles.tileAdd}>
                <Plus aria-hidden size={20} />
                {buttonLabel}
              </span>
            </button>
          ) : null}
        </div>
        {hint ? <p className={styles.hint}>{hint}</p> : null}
        {limits.length ? <p className={styles.limits}>{limits.join(' · ')}</p> : null}
        {input}
        {errorsList}
      </div>
    )
  }

  if (isDropzone) {
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
            {hint ?? 'Drag and drop files here, or choose them from your device.'}
          </p>
          <p className={styles.limits}>{limits.join(' · ')}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={open}
            disabled={disabled}
            className={styles.choose}
          >
            {buttonLabel}
          </Button>
          {input}
        </div>
        {fileList}
        {errorsList}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cx(styles.root, className)}>
        <div className={cx(styles.compact, disabled && styles.disabled)}>
          <span className={styles.compactIcon}>
            <FileUp aria-hidden size={18} />
          </span>
          <span className={styles.compactBody}>
            <span className={styles.compactTitle}>{label}</span>
            <span className={styles.compactHint}>
              {hint ?? limits.join(' · ')}
            </span>
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={open}
            disabled={disabled}
          >
            {buttonLabel}
          </Button>
          {input}
        </div>
        {fileList}
        {errorsList}
      </div>
    )
  }

  return (
    <div className={cx(styles.root, className)}>
      <div className={styles.buttonRow}>
        <Button type="button" size="sm" variant="outline" onClick={open} disabled={disabled}>
          {buttonLabel}
        </Button>
        {hint ? <span className={styles.compactHint}>{hint}</span> : null}
        {input}
      </div>
      {limits.length ? <p className={styles.limits}>{limits.join(' · ')}</p> : null}
      {fileList}
      {errorsList}
    </div>
  )
}

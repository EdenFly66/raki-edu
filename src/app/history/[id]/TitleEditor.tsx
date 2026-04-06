'use client'

import { useState, useTransition } from 'react'

import { updateGeneratedContentTitleAction } from '@/app/history/[id]/actions'

type TitleEditorProps = {
  id: string
  initialTitle: string
}

export function TitleEditor({ id, initialTitle }: TitleEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    const nextTitle = title.trim()

    if (!nextTitle) {
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.set('id', id)
      formData.set('title', nextTitle)
      await updateGeneratedContentTitleAction(formData)
      setIsEditing(false)
    })
  }

  return (
    <div className="space-y-3">
      {isEditing ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text shadow-sm focus:border-primary focus:ring-2 focus:ring-primary-soft"
            onChange={(event) => setTitle(event.target.value)}
            required
            value={title}
          />
          <div className="flex gap-2">
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:bg-disabled-bg disabled:text-disabled-text"
              disabled={isPending || !title.trim()}
              onClick={handleSave}
              type="button"
            >
              Guardar
            </button>
            <button
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-primary-soft"
              onClick={() => {
                setTitle(initialTitle)
                setIsEditing(false)
              }}
              type="button"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold text-text">{initialTitle}</h2>
          <button
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-primary-soft"
            onClick={() => setIsEditing(true)}
            type="button"
          >
            Editar titulo
          </button>
        </div>
      )}
    </div>
  )
}

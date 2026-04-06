'use client'

import { useTransition } from 'react'

import {
  setGeneratedContentHelpfulAction,
  toggleGeneratedContentFavoriteAction,
} from '@/app/history/[id]/actions'

type CurationControlsProps = {
  id: string
  isFavorite: boolean
  isHelpful: boolean | null
}

function buttonClassName(isActive: boolean) {
  return isActive
    ? 'rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:bg-disabled-bg disabled:text-disabled-text'
    : 'rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-primary-soft disabled:bg-disabled-bg disabled:text-disabled-text'
}

export function CurationControls({
  id,
  isFavorite,
  isHelpful,
}: CurationControlsProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex flex-wrap gap-3">
      <button
        className={buttonClassName(isFavorite)}
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const formData = new FormData()
            formData.set('id', id)
            formData.set('isFavorite', String(isFavorite))
            await toggleGeneratedContentFavoriteAction(formData)
          })
        }
        type="button"
      >
        Favorito
      </button>

      <button
        className={buttonClassName(isHelpful === true)}
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const formData = new FormData()
            formData.set('id', id)
            formData.set('isHelpful', 'true')
            await setGeneratedContentHelpfulAction(formData)
          })
        }
        type="button"
      >
        Util
      </button>

      <button
        className={buttonClassName(isHelpful === false)}
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const formData = new FormData()
            formData.set('id', id)
            formData.set('isHelpful', 'false')
            await setGeneratedContentHelpfulAction(formData)
          })
        }
        type="button"
      >
        No util
      </button>
    </div>
  )
}

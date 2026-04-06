'use server'

import { revalidatePath } from 'next/cache'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function updateGeneratedContentTitleAction(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()

  if (!id || !title) {
    return
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const { error } = await supabase
    .from('generated_content')
    .update({ title })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to update generated content title:', error.message)
    return
  }

  revalidatePath(`/history/${id}`)
  revalidatePath('/history')
  revalidatePath('/dashboard')
}

async function updateGeneratedContentCuration(
  id: string,
  values: {
    is_favorite?: boolean
    is_helpful?: boolean | null
  }
) {
  if (!id) {
    return
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const { error } = await supabase
    .from('generated_content')
    .update(values)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to update generated content curation:', error.message)
    return
  }

  revalidatePath(`/history/${id}`)
  revalidatePath('/history')
  revalidatePath('/dashboard')
}

export async function toggleGeneratedContentFavoriteAction(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim()
  const isFavorite = String(formData.get('isFavorite') ?? '').trim() === 'true'

  await updateGeneratedContentCuration(id, {
    is_favorite: !isFavorite,
  })
}

export async function setGeneratedContentHelpfulAction(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim()
  const isHelpfulValue = String(formData.get('isHelpful') ?? '').trim()

  const isHelpful =
    isHelpfulValue === 'true'
      ? true
      : isHelpfulValue === 'false'
        ? false
        : null

  await updateGeneratedContentCuration(id, {
    is_helpful: isHelpful,
  })
}

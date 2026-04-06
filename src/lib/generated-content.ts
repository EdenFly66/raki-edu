type BaseGeneratedContentRow = {
  id: string
  created_at: string
  title: string | null
  is_favorite: boolean | null
  question_count: number | null
  content: string
  learning_objective_id: string
  resource_type_id: string | null
}

type ResourceTypeRow = {
  id: string
  name: string
}

type LearningObjectiveRow = {
  id: string
  oa_code: string | null
  title: string
}

type GeneratedContentObjectiveRelationRow = {
  generated_content_id: string
  learning_objective_id: string
  sort_order: number
  learning_objectives:
    | {
        oa_code: string | null
        title: string
      }
    | {
        oa_code: string | null
        title: string
      }[]
    | null
}

export type GeneratedContentListItem = {
  id: string
  created_at: string
  title: string | null
  is_favorite: boolean | null
  question_count: number | null
  content: string
  learning_objective_id: string
  resourceTypeName: string | null
  objectives: string[]
}

function normalizeObjective(
  objective:
    | {
        oa_code: string | null
        title: string
      }
    | {
        oa_code: string | null
        title: string
      }[]
    | null
) {
  return Array.isArray(objective) ? objective[0] : objective
}

function formatObjective(objective: LearningObjectiveRow | null | undefined) {
  if (!objective) {
    return null
  }

  return objective.oa_code
    ? `${objective.oa_code} - ${objective.title}`
    : objective.title
}

export async function loadGeneratedContentList({
  supabase,
  userId,
  limit,
  logContext,
}: {
  supabase: any
  userId: string
  limit?: number
  logContext: string
}) {
  let baseQuery = supabase
    .from('generated_content')
    .select(
      'id, created_at, title, is_favorite, question_count, content, learning_objective_id, resource_type_id'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (typeof limit === 'number') {
    baseQuery = baseQuery.limit(limit)
  }

  const { data: baseItems, error: baseError } =
    await baseQuery

  if (baseError) {
    console.error(`${logContext}: failed to load generated_content`, baseError)
    return {
      items: [] as GeneratedContentListItem[],
      error: 'No fue posible cargar tus recursos en este momento.',
    }
  }

  const rows = (baseItems as BaseGeneratedContentRow[] | null) ?? []

  if (!rows.length) {
    return {
      items: [] as GeneratedContentListItem[],
      error: '',
    }
  }

  const resourceTypeIds = Array.from(
    new Set(rows.map((row) => row.resource_type_id).filter(Boolean))
  )
  const legacyObjectiveIds = Array.from(
    new Set(rows.map((row) => row.learning_objective_id).filter(Boolean))
  )
  const generatedContentIds = rows.map((row) => row.id)

  const [
    { data: resourceTypes, error: resourceTypesError },
    { data: objectiveRelations, error: objectiveRelationsError },
    { data: legacyObjectives, error: legacyObjectivesError },
  ] = await Promise.all([
    resourceTypeIds.length
      ? supabase
          .from('resource_types')
          .select('id, name')
          .in('id', resourceTypeIds)
      : Promise.resolve({ data: [], error: null }),
    generatedContentIds.length
      ? supabase
          .from('generated_content_learning_objectives')
          .select(
            'generated_content_id, learning_objective_id, sort_order, learning_objectives(oa_code, title)'
          )
          .in('generated_content_id', generatedContentIds)
          .order('sort_order')
      : Promise.resolve({ data: [], error: null }),
    legacyObjectiveIds.length
      ? supabase
          .from('learning_objectives')
          .select('id, oa_code, title')
          .in('id', legacyObjectiveIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (resourceTypesError) {
    console.error(`${logContext}: failed to load resource_types`, resourceTypesError)
  }

  if (objectiveRelationsError) {
    console.error(
      `${logContext}: failed to load generated_content_learning_objectives`,
      objectiveRelationsError
    )
  }

  if (legacyObjectivesError) {
    console.error(
      `${logContext}: failed to load legacy learning_objectives`,
      legacyObjectivesError
    )
  }

  const resourceTypeMap = new Map(
    ((resourceTypes as ResourceTypeRow[] | null) ?? []).map((resourceType) => [
      resourceType.id,
      resourceType.name,
    ])
  )

  const legacyObjectiveMap = new Map(
    ((legacyObjectives as LearningObjectiveRow[] | null) ?? []).map((objective) => [
      objective.id,
      objective,
    ])
  )

  const objectiveRelationMap = new Map<string, string[]>()

  ;((objectiveRelations as GeneratedContentObjectiveRelationRow[] | null) ?? []).forEach(
    (relation) => {
      const normalized = normalizeObjective(relation.learning_objectives)
      const formatted = formatObjective(
        normalized
          ? {
              id: relation.learning_objective_id,
              oa_code: normalized.oa_code,
              title: normalized.title,
            }
          : null
      )

      if (!formatted) {
        return
      }

      const current = objectiveRelationMap.get(relation.generated_content_id) ?? []
      current.push(formatted)
      objectiveRelationMap.set(relation.generated_content_id, current)
    }
  )

  const items = rows.map((row) => {
    const relationObjectives = objectiveRelationMap.get(row.id) ?? []
    const fallbackLegacyObjective = formatObjective(
      legacyObjectiveMap.get(row.learning_objective_id)
    )

    return {
      ...row,
      resourceTypeName: row.resource_type_id
        ? resourceTypeMap.get(row.resource_type_id) ?? null
        : null,
      objectives:
        relationObjectives.length
          ? relationObjectives
          : fallbackLegacyObjective
            ? [fallbackLegacyObjective]
            : [row.learning_objective_id],
    }
  })

  return {
    items,
    error:
      resourceTypesError || objectiveRelationsError || legacyObjectivesError
        ? 'Algunos metadatos no se pudieron cargar completamente.'
        : '',
  }
}

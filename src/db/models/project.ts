import slug from 'slug'
import { generateRandomString, alphabet } from 'oslo/crypto'

import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { projectsTable } from '@/db/schema'
import type { SelectProject, InsertProject } from '@/db/schema'
import { SLUG_RANDOM_STRING_SIZE } from '@/types'

interface InsertProps extends Omit<InsertProject, 'slug'> {
  slug?: string
}

export async function getProjectBySlug(slug: string): Promise<SelectProject | undefined> {
  return await db.select().from(projectsTable).where(eq(projectsTable.slug, slug)).get()
}

export async function createProject(data: InsertProps): Promise<SelectProject> {
  const generatedSlug = slug(
    `${data.name}-${generateRandomString(SLUG_RANDOM_STRING_SIZE, alphabet('a-z', '0-9'))}`
  )
  return await db
    .insert(projectsTable)
    .values({ slug: generatedSlug, ...data })
    .returning()
    .get()
}

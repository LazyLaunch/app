import { and, eq, sql } from 'drizzle-orm'
import { alphabet, generateRandomString } from 'oslo/crypto'
import slug from 'slug'

import { db } from '@/db'
import { projectsTable, teamsTable, userTeamsTable } from '@/db/schema'
import { UserRolesEnum } from '@/lib/rbac'
import { SLUG_RANDOM_STRING_SIZE } from '@/types'

import type { InsertTeam, SelectTeam } from '@/db/schema'

export interface Team extends Omit<SelectTeam, 'updatedAt' | 'createdAt'> {
  role: string
}

const teamSelectFields = {
  id: teamsTable.id,
  name: teamsTable.name,
  slug: teamsTable.slug,
  address: teamsTable.address,
  role: userTeamsTable.role,
  ownerId: teamsTable.ownerId,
}

async function executeTeamQuery(whereClause: any) {
  return db
    .select(teamSelectFields)
    .from(userTeamsTable)
    .innerJoin(teamsTable, eq(userTeamsTable.teamId, teamsTable.id))
    .where(whereClause)
    .prepare()
}

export async function getTeamBySlugAndUser({
  slug,
  userId,
}: {
  slug: string
  userId: string
}): Promise<Team | undefined> {
  const prepared = await executeTeamQuery(
    and(
      eq(userTeamsTable.userId, sql.placeholder('userId')),
      eq(teamsTable.slug, sql.placeholder('slug'))
    )
  )
  return prepared.get({ slug, userId }) as Promise<Team | undefined>
}

export async function getTeamByIds({
  teamId,
  userId,
}: {
  userId: string
  teamId: string
}): Promise<Team | undefined> {
  const prepared = await executeTeamQuery(
    and(
      eq(userTeamsTable.userId, sql.placeholder('userId')),
      eq(userTeamsTable.teamId, sql.placeholder('teamId'))
    )
  )
  return prepared.get({ teamId, userId }) as Promise<Team | undefined>
}

export async function getTeamsByUser({ userId }: { userId: string }): Promise<Team[]> {
  const prepared = await executeTeamQuery(eq(userTeamsTable.userId, sql.placeholder('userId')))
  return prepared.all({ userId })
}

interface InsertProps extends Omit<InsertTeam, 'slug' | 'id' | 'createdAt' | 'updatedAt'> {
  slug?: string
}

export async function createTeam(data: InsertProps): Promise<SelectTeam> {
  const generatedSlug = slug(
    `${data.name}-${generateRandomString(SLUG_RANDOM_STRING_SIZE, alphabet('a-z', '0-9'))}`
  )

  return await db.transaction(async (tx) => {
    const team = await tx
      .insert(teamsTable)
      .values({ slug: generatedSlug, ...data })
      .returning()
      .get()

    await tx
      .insert(userTeamsTable)
      .values({ userId: team.ownerId, teamId: team.id, role: UserRolesEnum.OWNER })

    return team
  })
}

export interface UpdateTeamProps {
  data: {
    name: string
    address: string
  }
  team: Team
}

export async function updateTeam({ data, team }: UpdateTeamProps): Promise<SelectTeam | boolean> {
  if (!team || team?.role !== UserRolesEnum.OWNER) return false

  return await db
    .update(teamsTable)
    .set(data)
    .where(and(eq(teamsTable.slug, team.slug), eq(teamsTable.ownerId, team.ownerId)))
    .returning()
    .get()
}

export async function deleteTeam(team: Team): Promise<boolean> {
  if (!team || team?.role !== UserRolesEnum.OWNER) return false

  await db
    .delete(teamsTable)
    .where(and(eq(teamsTable.slug, team.slug), eq(teamsTable.ownerId, team.ownerId)))
  return true
}

export async function existsTeam(userId: string): Promise<boolean> {
  const team = await db
    .select({
      exists: sql`exists(select 1)`,
    })
    .from(userTeamsTable)
    .innerJoin(teamsTable, eq(userTeamsTable.teamId, teamsTable.id))
    .where(eq(userTeamsTable.userId, userId))
    .get()

  return Number(team?.exists) > 0
}

interface InitTeamAndProjectProps {
  teamName: string
  projectName: string
  address: string
  userId: string
}

export async function initTeamWithProject({
  teamName,
  projectName,
  address,
  userId,
}: InitTeamAndProjectProps) {
  const generatedTeamSlug = slug(
    `${teamName}-${generateRandomString(SLUG_RANDOM_STRING_SIZE, alphabet('a-z', '0-9'))}`
  )
  const generatedProjectSlug = slug(
    `${projectName}-${generateRandomString(SLUG_RANDOM_STRING_SIZE, alphabet('a-z', '0-9'))}`
  )

  await db.transaction(async (tx) => {
    const team = await tx
      .insert(teamsTable)
      .values({ slug: generatedTeamSlug, name: teamName, ownerId: userId, address })
      .returning()
      .get()

    await tx
      .insert(userTeamsTable)
      .values({ userId: team.ownerId, teamId: team.id, role: UserRolesEnum.OWNER })

    await tx
      .insert(projectsTable)
      .values({ slug: generatedProjectSlug, name: projectName, teamId: team.id })
  })
}

import { db } from '@/db'
import { userTeamsTable, type SelectUserTeam } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

interface UserTeam extends Omit<SelectUserTeam, 'role'> {}

export async function getUserTeam({
  userId,
  teamId,
}: UserTeam): Promise<SelectUserTeam | undefined> {
  return await db
    .select()
    .from(userTeamsTable)
    .where(and(eq(userTeamsTable.teamId, teamId), eq(userTeamsTable.userId, userId)))
    .get()
}

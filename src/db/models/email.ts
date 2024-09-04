import { db } from '@/db'
import type { InsertEmail, SelectEmail } from '@/db/schema'
import { emailsTable, usersTable } from '@/db/schema'
import type { Column, InferSelectModel } from 'drizzle-orm'
import { and, eq, sql } from 'drizzle-orm'

type EmailsTableColumns = keyof InferSelectModel<typeof emailsTable>
type SelectedFieldsType = Partial<Record<EmailsTableColumns, Column<any, any>>>

function selectedFields(fields: EmailsTableColumns[]): SelectedFieldsType {
  return fields
    ? fields.reduce((acc, field) => {
        acc[field] = emailsTable[field]
        return acc
      }, {} as SelectedFieldsType)
    : emailsTable
}

async function executeEmailQuery(fields: EmailsTableColumns[], whereClause: any) {
  return db.select(selectedFields(fields!)).from(emailsTable).where(whereClause).prepare()
}

interface EmailsByUserProps {
  userId: string
  fields?: EmailsTableColumns[]
}

export async function getEmailsByUser({
  userId,
  fields,
}: EmailsByUserProps): Promise<Partial<SelectEmail>[]> {
  const prepared = await executeEmailQuery(
    fields!,
    eq(emailsTable.userId, sql.placeholder('userId'))
  )
  return await prepared.all({ userId })
}

interface EmailByUserProps {
  userId: string
  email: string
  fields?: EmailsTableColumns[]
}

export async function getEmailByUser({
  userId,
  email,
  fields,
}: EmailByUserProps): Promise<Partial<SelectEmail | undefined>> {
  const prepared = await executeEmailQuery(
    fields!,
    and(
      eq(emailsTable.userId, sql.placeholder('userId')),
      eq(emailsTable.name, sql.placeholder('email'))
    )
  )
  return await prepared.get({ userId, email })
}

export async function createEmail(data: InsertEmail): Promise<SelectEmail> {
  return await db.insert(emailsTable).values(data).returning().get()
}

export async function deleteEmail(email: string, userId: string): Promise<void> {
  await db
    .delete(emailsTable)
    .where(and(eq(emailsTable.name, email), eq(emailsTable.userId, userId)))
}

async function executeEmailExistsQuery(whereClause: any) {
  return db
    .select({
      exists: sql`exists(select 1)`,
    })
    .from(emailsTable)
    .where(whereClause)
    .prepare()
}

export async function setPrimaryEmail(email: string, userId: string): Promise<void> {
  const prepared = await executeEmailExistsQuery(
    and(
      eq(emailsTable.name, sql.placeholder('email')),
      eq(emailsTable.userId, sql.placeholder('userId')),
      eq(emailsTable.primary, sql.placeholder('isPrimary')),
      eq(emailsTable.verified, sql.placeholder('isVerified'))
    )
  )
  const emailExists = await prepared.get({ email, userId, isPrimary: false, isVerified: true })

  if (Number(emailExists?.exists) > 0) {
    await db.transaction(async (tx) => {
      await tx.update(usersTable).set({ email }).where(eq(usersTable.id, userId))
      await tx.update(emailsTable).set({ primary: false }).where(eq(emailsTable.userId, userId))
      await tx
        .update(emailsTable)
        .set({ primary: true })
        .where(and(eq(emailsTable.name, email), eq(emailsTable.userId, userId)))
    })
  }
}

export async function existsEmail(email: string): Promise<boolean> {
  const prepared = await executeEmailExistsQuery(eq(emailsTable.name, sql.placeholder('email')))
  const obj = await prepared.get({ email })

  return Number(obj?.exists) > 0
}

export async function existsPrimaryEmail(email: string, userId: string): Promise<boolean> {
  const prepared = await executeEmailExistsQuery(
    and(
      eq(emailsTable.name, sql.placeholder('email')),
      eq(emailsTable.userId, sql.placeholder('userId')),
      eq(emailsTable.primary, sql.placeholder('isPrimary'))
    )
  )
  const obj = await prepared.get({ email, userId, isPrimary: true })

  return Number(obj?.exists) > 0
}

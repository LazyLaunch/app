import { db } from '@/db'
import type { InsertEmail, SelectEmail } from '@/db/schema'
import { emailsTable, usersTable } from '@/db/schema'
import type { Column, InferSelectModel } from 'drizzle-orm'
import { and, eq, sql } from 'drizzle-orm'

type EmailsTableColumns = keyof InferSelectModel<typeof emailsTable>
type SelectedFieldsType = Partial<Record<EmailsTableColumns, Column<any, any>>>

interface EmailsByUserProps {
  userId: string
  fields?: EmailsTableColumns[]
}

interface EmailByUserProps {
  userId: string
  email: string
  fields?: EmailsTableColumns[]
}

function selectedFields(fields: EmailsTableColumns[]): SelectedFieldsType {
  return fields
    ? fields.reduce((acc, field) => {
        acc[field] = emailsTable[field]
        return acc
      }, {} as SelectedFieldsType)
    : emailsTable
}

export async function getEmailsByUser({
  userId,
  fields,
}: EmailsByUserProps): Promise<Partial<SelectEmail>[]> {
  return await db
    .select(selectedFields(fields!))
    .from(emailsTable)
    .where(eq(emailsTable.userId, userId))
}

export async function getEmailByUser({
  userId,
  email,
  fields,
}: EmailByUserProps): Promise<Partial<SelectEmail | undefined>> {
  return await db
    .select(selectedFields(fields!))
    .from(emailsTable)
    .where(and(eq(emailsTable.name, email), eq(emailsTable.userId, userId)))
    .get()
}

export async function createEmail(data: InsertEmail): Promise<SelectEmail> {
  return await db.insert(emailsTable).values(data).returning().get()
}

export async function deleteEmail(email: string, userId: string): Promise<void> {
  await db
    .delete(emailsTable)
    .where(and(eq(emailsTable.name, email), eq(emailsTable.userId, userId)))
}

export async function setPrimaryEmail(email: string, userId: string): Promise<void> {
  await db.transaction(async (tx) => {
    const query = sql`select exists(select 1 from ${emailsTable} where (${emailsTable.name} = ${email} and ${emailsTable.userId} = ${userId} and ${emailsTable.verified} is TRUE and ${emailsTable.primary} is FALSE))`
    const result = (await db.get(query)) || {}
    if (Object.values(result)[0] === 0) tx.rollback()

    await tx.update(usersTable).set({ email }).where(eq(usersTable.id, userId))
    await tx.update(emailsTable).set({ primary: false }).where(eq(emailsTable.userId, userId))
    await tx
      .update(emailsTable)
      .set({ primary: true })
      .where(and(eq(emailsTable.name, email), eq(emailsTable.userId, userId)))
  })
}

export async function existsEmail(email: string): Promise<boolean> {
  const query = sql`select exists(select 1 from ${emailsTable} where (${emailsTable.name} = ${email}))`
  const result = (await db.get(query)) || {}
  return Object.values(result)[0] > 0
}

export async function existsPrimaryEmail(email: string, userId: string): Promise<boolean> {
  const query = sql`select exists(select 1 from ${emailsTable} where (${emailsTable.name} = ${email} and ${emailsTable.userId} = ${userId} and ${emailsTable.primary} is TRUE))`
  const result = (await db.get(query)) || {}
  return Object.values(result)[0] > 0
}

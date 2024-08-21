import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { accountsTable } from '@/db/schema'
import type { SelectAccount, InsertAccount } from '@/db/schema'

export async function getAccountByProvider(
  account: Pick<SelectAccount, 'provider' | 'providerAccountId'>
): Promise<SelectAccount | undefined> {
  return db
    .select()
    .from(accountsTable)
    .where(
      and(
        eq(accountsTable.provider, account.provider),
        eq(accountsTable.providerAccountId, account.providerAccountId)
      )
    )
    .get()
}

export async function linkAccount(data: InsertAccount): Promise<SelectAccount> {
  return await db.insert(accountsTable).values(data).returning().get()
}

import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const gifts=sqliteTable('gifts',{token:text('token').primaryKey(),status:text('status').notNull().default('new'),prediction:integer('prediction'),receipt:text('receipt'),createdAt:integer('created_at').notNull(),claimedAt:integer('claimed_at')});

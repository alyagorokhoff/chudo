import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const gifts=sqliteTable('gifts',{token:text('token').primaryKey(),status:text('status').notNull().default('created'),kind:text('kind').notNull().default('ticket'),task:integer('task'),receipt:text('receipt'),created:text('created').notNull(),claimed:text('claimed')});
export const events=sqliteTable('events',{id:integer('id').primaryKey({autoIncrement:true}),event:text('event').notNull(),created:text('created').notNull()});

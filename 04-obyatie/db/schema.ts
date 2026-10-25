import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const gifts=sqliteTable('gifts',{token:text('token').primaryKey(),status:text('status').notNull().default('created'),kind:text('kind').notNull().default('hug'),task:integer('task'),receipt:text('receipt'),created:text('created').notNull(),claimed:text('claimed')});
export const events=sqliteTable('events',{id:integer('id').primaryKey({autoIncrement:true}),event:text('event').notNull(),created:text('created').notNull()});

export const budgets=sqliteTable('budgets',{bucket:text('bucket').primaryKey(),count:integer('count').notNull().default(0),expires:text('expires').notNull()});

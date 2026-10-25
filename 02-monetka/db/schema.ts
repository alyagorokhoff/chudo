import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const gifts=sqliteTable('gifts',{token:text('token').primaryKey(),status:text('status').notNull().default('created'),created:integer('created').notNull(),claimed:integer('claimed'),proof:text('proof'),saved:text('saved')});
export const coins=sqliteTable('coins',{token:text('token').primaryKey(),created:integer('created').notNull(),active:integer('active').notNull().default(1)});
export const events=sqliteTable('events',{id:integer('id').primaryKey({autoIncrement:true}),kind:text('kind').notNull(),at:integer('at').notNull()});
export const limits=sqliteTable('limits',{key:text('key').primaryKey(),count:integer('count').notNull()});

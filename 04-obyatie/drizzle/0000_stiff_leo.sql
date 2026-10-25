CREATE TABLE `budgets` (
	`bucket` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`expires` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gifts` (
	`token` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'created' NOT NULL,
	`kind` text DEFAULT 'hug' NOT NULL,
	`task` integer,
	`receipt` text,
	`created` text NOT NULL,
	`claimed` text
);

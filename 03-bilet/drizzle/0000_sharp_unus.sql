CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gifts` (
	`token` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'created' NOT NULL,
	`kind` text DEFAULT 'ticket' NOT NULL,
	`task` integer,
	`receipt` text,
	`created` text NOT NULL,
	`claimed` text
);

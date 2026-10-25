CREATE TABLE `coins` (
	`token` text PRIMARY KEY NOT NULL,
	`created` integer NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gifts` (
	`token` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'created' NOT NULL,
	`created` integer NOT NULL,
	`claimed` integer,
	`proof` text,
	`saved` text
);
--> statement-breakpoint
CREATE TABLE `limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL
);

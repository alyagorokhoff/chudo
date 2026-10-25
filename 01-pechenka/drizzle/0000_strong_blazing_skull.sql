CREATE TABLE `gifts` (
	`token` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`prediction` integer,
	`receipt` text,
	`created_at` integer NOT NULL,
	`claimed_at` integer
);

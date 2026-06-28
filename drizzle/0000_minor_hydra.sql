CREATE TABLE `category` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `piece` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category_id` integer NOT NULL,
	`name` text NOT NULL,
	`info` text,
	`key` text,
	`top_priority` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `source` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`piece_id` integer NOT NULL,
	`name` text NOT NULL,
	`info` text,
	`key` text,
	`link` text,
	`attachment_path` text,
	`attachment_type` text,
	`attachment_filename` text,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`piece_id`) REFERENCES `piece`(`id`) ON UPDATE no action ON DELETE cascade
);

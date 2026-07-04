CREATE TABLE `contacts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`careof` text,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `customers` ADD `type` text DEFAULT 'private' NOT NULL;
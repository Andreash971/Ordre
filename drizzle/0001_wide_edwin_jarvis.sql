CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`saved_at` integer NOT NULL,
	`expires_at` integer,
	`delivery_date` text,
	`source` text,
	`data` text NOT NULL
);

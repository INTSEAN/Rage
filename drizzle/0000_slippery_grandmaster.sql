CREATE TABLE `game_rooms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`host_name` text NOT NULL,
	`max_players` integer DEFAULT 8 NOT NULL,
	`current_level` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_rooms_code_unique` ON `game_rooms` (`code`);--> statement-breakpoint
CREATE TABLE `room_players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_id` integer NOT NULL,
	`player_name` text NOT NULL,
	`player_color` text NOT NULL,
	`position_x` real DEFAULT 0 NOT NULL,
	`position_y` real DEFAULT 0 NOT NULL,
	`direction` text DEFAULT 'right' NOT NULL,
	`last_updated` text NOT NULL,
	`joined_at` text NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `game_rooms`(`id`) ON UPDATE no action ON DELETE no action
);

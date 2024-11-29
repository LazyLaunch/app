CREATE TABLE `contact_groups` (
	`contact_id` text(256) NOT NULL,
	`group_id` text(256) NOT NULL,
	PRIMARY KEY(`contact_id`, `group_id`),
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` text(256) PRIMARY KEY NOT NULL,
	`name` text(25) NOT NULL,
	`project_id` text(256) NOT NULL,
	`team_id` text(256) NOT NULL,
	`user_id` text(256) NOT NULL,
	`created_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `groups_project_idx` ON `groups` (`project_id`);--> statement-breakpoint
CREATE INDEX `groups_team_idx` ON `groups` (`team_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `groups_name` ON `groups` (`name`,`project_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_filter_conditions` (
	`id` text(256) PRIMARY KEY NOT NULL,
	`filter_id` text(256) NOT NULL,
	`column_name` text(256) NOT NULL,
	`column_type` text(50) NOT NULL,
	`operator` integer NOT NULL,
	`value` text(256),
	`secondary_value` text(256),
	`condition_type` integer DEFAULT 0 NOT NULL,
	`created_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`filter_id`) REFERENCES `filters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_filter_conditions`("id", "filter_id", "column_name", "column_type", "operator", "value", "secondary_value", "condition_type", "created_at") SELECT "id", "filter_id", "column_name", "column_type", "operator", "value", "secondary_value", "condition_type", "created_at" FROM `filter_conditions`;--> statement-breakpoint
DROP TABLE `filter_conditions`;--> statement-breakpoint
ALTER TABLE `__new_filter_conditions` RENAME TO `filter_conditions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `filter_conditions_filter_idx` ON `filter_conditions` (`filter_id`);--> statement-breakpoint
CREATE TABLE `__new_filters` (
	`id` text(256) PRIMARY KEY NOT NULL,
	`name` text(25) NOT NULL,
	`project_id` text(256) NOT NULL,
	`team_id` text(256) NOT NULL,
	`user_id` text(256) NOT NULL,
	`created_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_filters`("id", "name", "project_id", "team_id", "user_id", "created_at") SELECT "id", "name", "project_id", "team_id", "user_id", "created_at" FROM `filters`;--> statement-breakpoint
DROP TABLE `filters`;--> statement-breakpoint
ALTER TABLE `__new_filters` RENAME TO `filters`;--> statement-breakpoint
CREATE INDEX `filters_project_idx` ON `filters` (`project_id`);--> statement-breakpoint
CREATE INDEX `filters_team_idx` ON `filters` (`team_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `filters_name` ON `filters` (`name`,`project_id`);
CREATE TABLE `accounts` (
	`provider` text(32) NOT NULL,
	`provider_account_id` text NOT NULL,
	`user_id` text(256) NOT NULL,
	`type` text(50) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`updated_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`created_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	PRIMARY KEY(`provider`, `provider_account_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `contact_custom_fields` (
	`contact_id` text(256) NOT NULL,
	`custom_field_id` text(256) NOT NULL,
	`value` text(256),
	PRIMARY KEY(`contact_id`, `custom_field_id`),
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`custom_field_id`) REFERENCES `custom_fields`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text(256) PRIMARY KEY NOT NULL,
	`email` text(256) NOT NULL,
	`first_name` text(256),
	`last_name` text(256),
	`subscribed` integer DEFAULT true NOT NULL,
	`source` text(25) DEFAULT 'app' NOT NULL,
	`user_id` text(256) NOT NULL,
	`project_id` text(256) NOT NULL,
	`team_id` text(256) NOT NULL,
	`updated_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`created_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `custom_fields` (
	`id` text(256) PRIMARY KEY NOT NULL,
	`name` text(50) NOT NULL,
	`type` text DEFAULT 'text' NOT NULL,
	`project_id` text(256) NOT NULL,
	`team_id` text(256) NOT NULL,
	`user_id` text(256) NOT NULL,
	`updated_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`created_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `email_templates` (
	`id` text(256) PRIMARY KEY NOT NULL,
	`name` text(50) NOT NULL,
	`description` text(256),
	`emoji` text NOT NULL,
	`content` text NOT NULL,
	`settings` text NOT NULL,
	`user_id` text(256) NOT NULL,
	`project_id` text(256) NOT NULL,
	`team_id` text(256) NOT NULL,
	`updated_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`created_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `emails` (
	`name` text(256) PRIMARY KEY NOT NULL,
	`user_id` text(256) NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`primary` integer DEFAULT false NOT NULL,
	`updated_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`created_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text(256) PRIMARY KEY NOT NULL,
	`name` text(50) NOT NULL,
	`slug` text(50) NOT NULL,
	`team_id` text(256) NOT NULL,
	`updated_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`created_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` text(256) PRIMARY KEY NOT NULL,
	`user_id` text(256) NOT NULL,
	`expires_at` integer NOT NULL,
	`fresh` integer,
	`created_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text(256) PRIMARY KEY NOT NULL,
	`name` text(50) NOT NULL,
	`slug` text(50) NOT NULL,
	`address` text(256) NOT NULL,
	`owner_id` text(256) NOT NULL,
	`updated_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`created_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_teams` (
	`user_id` text(256) NOT NULL,
	`team_id` text(256) NOT NULL,
	`role` text(50) NOT NULL,
	PRIMARY KEY(`user_id`, `team_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text(256) PRIMARY KEY NOT NULL,
	`name` text(32) NOT NULL,
	`username` text(50) NOT NULL,
	`email` text(256) NOT NULL,
	`picture` text(256),
	`updated_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`created_at` text(50) DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `accounts_user_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `contact_custom_fields_value` ON `contact_custom_fields` (`value`);--> statement-breakpoint
CREATE UNIQUE INDEX `contacts_email_project_idx` ON `contacts` (`email`,`project_id`);--> statement-breakpoint
CREATE INDEX `contacts_email` ON `contacts` (`email`);--> statement-breakpoint
CREATE INDEX `contacts_first_name` ON `contacts` (`first_name`);--> statement-breakpoint
CREATE INDEX `contacts_last_name` ON `contacts` (`last_name`);--> statement-breakpoint
CREATE INDEX `contacts_subscribed` ON `contacts` (`subscribed`);--> statement-breakpoint
CREATE INDEX `contacts_user_idx` ON `contacts` (`user_id`);--> statement-breakpoint
CREATE INDEX `contacts_project_idx` ON `contacts` (`project_id`);--> statement-breakpoint
CREATE INDEX `contacts_team_idx` ON `contacts` (`team_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `custom_fields_name_and_project_idx` ON `custom_fields` (`name`,`project_id`);--> statement-breakpoint
CREATE INDEX `custom_fields_project_idx` ON `custom_fields` (`project_id`);--> statement-breakpoint
CREATE INDEX `custom_fields_team_idx` ON `custom_fields` (`team_id`);--> statement-breakpoint
CREATE INDEX `email_templates_name` ON `email_templates` (`name`);--> statement-breakpoint
CREATE INDEX `email_templates_user_idx` ON `email_templates` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_templates_project_idx` ON `email_templates` (`project_id`);--> statement-breakpoint
CREATE INDEX `email_templates_team_idx` ON `email_templates` (`team_id`);--> statement-breakpoint
CREATE INDEX `emails_user_idx` ON `emails` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_idx` ON `projects` (`slug`);--> statement-breakpoint
CREATE INDEX `projects_team_idx` ON `projects` (`team_id`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `user_sessions` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `teams_slug_idx` ON `teams` (`slug`);--> statement-breakpoint
CREATE INDEX `teams_owner_idx` ON `teams` (`owner_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_idx` ON `users` (`username`);
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
CREATE INDEX `emails_user_idx` ON `emails` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_idx` ON `projects` (`slug`);--> statement-breakpoint
CREATE INDEX `projects_team_idx` ON `projects` (`team_id`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `user_sessions` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `teams_slug_idx` ON `teams` (`slug`);--> statement-breakpoint
CREATE INDEX `teams_owner_idx` ON `teams` (`owner_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_idx` ON `users` (`username`);
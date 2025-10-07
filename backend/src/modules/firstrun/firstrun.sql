PRAGMA journal_mode = WAL;

CREATE TABLE `data` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`database_url` text NOT NULL,
	`app_name` text,
	`admin_username` text NOT NULL,
	`admin_password` text NOT NULL, -- FUCKING HASH IT
	CONSTRAINT data_database_url_unique UNIQUE(`database_url`)
);

PRAGMA journal_mode = WAL;

CREATE TABLE `data` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`database_url` text NOT NULL,
	`url` text NOT NULL,
	`app_name` text,
	`admin_username` text NOT NULL,
	`admin_password` text NOT NULL, -- FUCKING HASH IT
	`registration_enabled` integer NOT NULL DEFAULT 0, -- Oauth Configuration will be stored in main db, we'll probably just pretend it's disabled if the main db ever fails, or store in memory
	CONSTRAINT data_database_url_unique UNIQUE(`database_url`)
);

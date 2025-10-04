PRAGMA journal_mode = WAL;

CREATE TABLE `data` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`database_url` text NOT NULL,
	CONSTRAINT data_database_url_unique UNIQUE(`database_url`)
);

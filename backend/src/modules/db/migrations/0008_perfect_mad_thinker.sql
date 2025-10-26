CREATE INDEX "name_search_index" ON "players" USING gin (to_tsvector('english', "name"));--> statement-breakpoint
CREATE INDEX "username_search_index" ON "users" USING gin (to_tsvector('english', "username"));--> statement-breakpoint
CREATE INDEX "display_name_search_index" ON "users" USING gin (to_tsvector('english', "display_name"));
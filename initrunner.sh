#!/usr/bin/env bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE USER runner;
	CREATE DATABASE remoteadminplus OWNER=runner;
	GRANT ALL PRIVILEGES ON DATABASE remoteadminplus TO runner;
EOSQL

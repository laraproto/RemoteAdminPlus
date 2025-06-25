# RemoteAdminPlus

RemoteAdminPlus is an attempt at an open source self-hostable SaaS to improve the moderation situation on SCP Secret Laboratory, also it's called RemoteAdminPlus because Remote Admin is the built in moderation tool for SL

## Roadmap
- [ ] Authentication (like 70% of the way there right now)
- [ ] Multi-factor authentication
- [ ] Panel creation
- [ ] Panel subdomains
- [ ] Permissions
- [ ] User invites
- [ ] First setup wizard

## Contributing

The current setup is a bit of an uhh, mess, you go into the backend folder, copy .env.example to .env, fill in the required variables, and then do the same thing in the website folder, other than you go back into the monorepo root and run `bun i`

Then you can run all of the components at once by running `bun run dev` in monorepo root, but you are better off just doing website and backend

## Production

Technically there's 2 ways of running this in production, by using the split envs and valkey and postgresql on host, or by using the docker compose file, to do so you can copy .env.example to .env, fill in the required values and step 3 profit??, and by that i mean run `docker compose up -d`
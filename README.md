# RemoteAdminPlus

RemoteAdminPlus is an attempt at an open source self-hostable panel to improve the moderation situation on SCP Secret Laboratory, also it's called RemoteAdminPlus because Remote Admin is the built in moderation tool for SL

## Roadmap
- [ ] Authentication (like 40% of the way there right now)
- [ ] Multi-factor authentication
- [ ] Permissions
- [ ] User invites
- [ ] First setup wizard

## Implementation plans

- First setup wizard
  - ~~This won't be like a full assisted setup probably, but just registration and some form of basic walkthrough~~ We going full walkthrough mate, since most of this is centered around moderation, registration will be disabled by default, but if people want to set up services surrounding the mod panel while using data from it, an api for that and an option to enable registration will be available
- Authentication
  - First user will be total admin, afterwards open registration will be disabled, and a user will have to use an invite code before being allowed to register, users will come with no permissions by default and role assignment will be blocked until they link at least one account, then anyone with role perms will be able to assign a role to them
- Permissions
  - Permissions can be given to both roles and users, group perms will be checked before user perms, but you can't give a user a role and then set a per user perm to take away that perm, at that point just make a new role or something
- User Invites
  - Hehe random bytes to hex go brrr

## First Run Wizard form

Database URL (filled and readonly when database hint is set)
App Name (optional)
Branding (optional)
OAuth Config (optional but gives option to disable registration form and make oauth primary method)
SMTP Configuration (optional)
Superadmin user creation

## Contributing

The current setup is a bit of an uhh, mess, you go into the backend folder, copy .env.example to .env, fill in the required variables, and then do the same thing in the website folder, other than you go back into the monorepo root and run `bun i`

Then you can run all of the components at once by running `bun run dev` in monorepo root, but you are better off just doing website and backend

## ~~Production~~

~~Technically there's 2 ways of running this in production, by using the split envs and valkey and postgresql on host, or by using the docker compose file, to do so you can copy .env.example to .env, fill in the required values and step 3 profit??, and by that i mean run `docker compose up -d`~~

Production what production, a lot of stuff has undergone reworks so the docker compose file does not even work, fix to do

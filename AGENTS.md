# AGENTS.md — Task Vault

এই repo-টি খুব ছোট এবং ইচ্ছাকৃতভাবে "beginner skeleton" অবস্থায় আছে। ধাপে ধাপে production-grade-এ transform করা হবে। তাই নিচের তথ্যগুলোই source of truth — root `README.md` নয় (দেখো "README সত্যি নয়" সেকশন)।

## Layout ও command

- Root-এ কোনো `package.json` নেই। **সব command `backend/` থেকে চালাতে হবে**।
- Package manager: `pnpm` (lockfile আছে, npm/yarn ব্যবহার করো না)।
- `backend/pnpm-workspace.yaml`-এ শুধু `allowBuilds: esbuild` — এটা single-package repo, workspace monorepo নয়।

| Command | আসলে যা চলে |
|---|---|
| `pnpm dev` | `tsx watch --env-file=.env server.ts` |
| `pnpm build` | শুধু `tsc` (typecheck + emit to `dist/`) |

- `test`, `lint`, `format`, `typecheck`, `start` script **নেই**। verification-এর একমাত্র উপায় `pnpm build`।
- কোনো test runner, linter, prettier/eslint config, CI workflow, docker-compose নেই — নতুন করে যোগ করলে সেটাই এই repo-র প্রথম occurrence হবে।

## Setup gotcha

- `.env` gitignored, এবং **`.env.example` নেই** (README-তে দাবি করা আছে)। Fresh clone-এ `pnpm dev` সাথে সাথে `MONGODB_URI is missing in .env` throw করবে। হাতে `.env` বানাতে হবে: `MONGODB_URI` (আবশ্যক), `PORT` (না দিলে code default 3000)।
- `MONGODB_URI` একটি **remote MongoDB Atlas cluster** (`mongodb+srv://...`), local mongod নয়। তাই dev/test চালাতে internet লাগে, connect হতে কয়েক সেকেন্ড লাগে, আর সবাই একই shared cluster-এর উপর কাজ করে — destructive test data লিখো না।
- `src/config/env.ts` module load-এই `process.env` পড়ে ও validate করে, তাই env বদলাতে হলে process restart লাগবে।

## সবচেয়ে বড় trap: path alias ও build

- `tsconfig.json`-এ alias আছে: `@app`, `@config/*`, `@modules/*`, `@routes/*`, `@shared/*`, `@utils/*`, `@middlewares/*`, `@dts/*`।
- `tsx` dev-time-এ এগুলো resolve করে, কিন্তু **`tsc` emitted JS-এ alias rewrite করে না**। ফলে `pnpm build` সফল হলেও `node dist/server.js` `ERR_INVALID_MODULE_SPECIFIER: Invalid module "@app"` দিয়ে crash করে (verified)।
- মানে: **`pnpm build` pass করা মানে "production runnable" নয়**। `dist/` দিয়ে deploy করার চেষ্টা করো না যতকিনা না alias সমাধান (import map / `tsc-alias` / relative import) যোগ হচ্ছে।

## ESM / TypeScript conventions

- `"type": "module"`, `module` ও `moduleResolution`: `nodenext` → **প্রতিটি relative import-এ `.js` extension বাধ্যতামূলক** (`./auth.services.js`)। extension ছাড়া build/runtime দুটোই ভাঙে।
- `verbatimModuleSyntax: true` → type-only import-এর জন্য `import type {...}` বাধ্যতামূলক।
- `strict` + `noUncheckedIndexedAccess` on।
- Codebase দুই রকম style-এ লেখা (কিছু ফাইলে semicolon, কিছুতে নেই) — চারপাশের ফাইলের style অনুসরণ করো, নতুন convention প্রচার করো না।

## Architecture (বাস্তব অবস্থা)

```
backend/server.ts              → bootstrap: connectDB() তারপর app.listen(env.PORT)
backend/src/app.ts             → Express app তৈরি করে
backend/src/routes/index.ts    → feature router aggregate
backend/src/config/env.ts      → env read + ন্যূনতম validation
backend/src/config/db.ts       → mongoose connect/disconnect
backend/src/modules/<feature>/ → <feature>.routes.ts → .controllers.ts → .services.ts
```

- Feature module pattern: routes → controllers → services; input interface (যেমন `RegisterInput`) services ফাইলেই থাকে, controller শুধু parse করে service-কে call করে।
- **বর্তমানে router mount করা হয়নি**: `src/app.ts` `router` import করে কিন্তু `app.use(router)` কড়ায় না, এবং `express.json()`-ও নেই। ফলে `/auth/register` → `404 Cannot POST` (curl দিয়ে verified)। নতুন route বানানোর আগে এই gap-টা বুঝে নাও।
- `auth.controllers.ts`-এর `register` response পাঠায় না (`Promise<void>`, শুধু service call করে বসে) — mount করার পর request hang করবে। `auth.services.ts` সরাসরি `throw new Error(...)` করে; কোনো error middleware নেই বলে সেই error ধরা পড়বে না।

## README সত্যি নয়

Root `README.md` একটি **মিলিয়ে-ফেলা (deleted) codebase**-এর documentation: `config/env/schema.ts`, `config/env/primitives.ts`, `shared/`, `utils/logger.ts`, `utils/http.server.ts`, `middlewares/error.middleware.ts`, Zod validation, Pino logging, graceful shutdown — এগুলো `shanto` branch-এ লেখা হয়েছিল, পরে commit `bc0a8e5`-এ মুছে ফেলা হয়েছে। README-কে **target vision** হিসেবে পড়ো, current state হিসেবে নয়। (README-র বলা PORT default 5000 ও code-এর 3000-এর মিল নেই।)

## Beginner → production: এখন কী নেই

এগুলো intentional gap, ভুল নয়:

1. `app.use(router)` + `express.json()` wiring বাকি
2. error middleware ও 404 handler নেই
3. graceful shutdown / signal handling নেই (server.ts-এ signal handler নেই)
4. zod, pino, pino-http, pino-pretty **install করা আছে কিন্তু কোথাও use হচ্ছে না** — নতুন dependency না যোগ করে এগুলোকেই ধাপে ধাপে কাজে লাগাও
5. test, lint, CI নেই
6. auth পুরো stub — কোনো hashing, validation, বা response নেই

পরিকল্পিতভাবে refactor করো: ছোট ধাপে, existing structure মেনে, সাথে সাথে verify করে (`pnpm build`)। পুরো skeleton-টা একসাথে rewrite করো না।

## Git

- দুই remote: `origin` = `Bug-Slayerss/task-vault`, `personal` = `mdfahim18/task-vault`।
- দুই contributor আলাদা personal branch-এ কাজ করে: `fahim` (বর্তমান) ও `shanto`। `origin/HEAD` → `shanto`, কিন্তু `origin/shanto` এখনই `fahim`-এর ancestor — shanto-র মুছে ফেলা infra ফিরিয়ে আনার দরকার নেই।
- commit message Conventional Commits অনুসরণ করে (`feat(auth): ...`, `refactor: ...`)।
- branch-এ কাজ করো, direct commit থেকে বিরত থাকো; force-push ব্যবহার করো না।
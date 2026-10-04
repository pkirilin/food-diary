# Zod v4 migration research

Research date: **2026-10-04**. All version claims verified against the npm registry and upstream
source on that date. Zod docs were read from the source of zod.dev
(`colinhacks/zod` → `packages/docs/content/`, `main` at the last changelog commit `85dba7e`,
2026-08-13). Every "measured" claim comes from actually installing `zod@4.6.5` +
`@hookform/resolvers@5.9.1` into a **throwaway copy** of `src/frontend` and running `tsc`, `vitest`,
`eslint` and `vite build` on it. See [Appendix: how the probe was run](#appendix-how-the-probe-was-run).
No repo file other than this one was touched.

---

## 1. Bottom line

1. **Zod 4 is stable and well into its life cycle.** `zod@4.0.0` shipped **2025-07-09**; `latest`
   is **4.6.5** (2026-09-13). `npm view zod dist-tags --json` →
   `{"latest":"4.6.5","beta":"4.1.13-beta.0","canary":"4.5.0-canary…","alpha":"3.25.68-alpha.11","next":"3.25.0-beta…"}`.
   The **last 3.x release is 3.25.76 (2025-07-08)**: nothing has been published to the 3.x line in
   15 months.

2. **🔑 The resolver bump is not optional. `@hookform/resolvers@3.10.0` breaks at runtime with
   Zod 4.** Its `isZodError` is `Array.isArray(error?.errors)`
   (`node_modules/@hookform/resolvers/zod/src/zod.ts:6-7`), and Zod 4 **dropped `ZodError.errors`**
   ([changelog § drops `.errors`](https://zod.dev/v4/changelog)). Measured: a 3.10 resolver given
   a Zod 4 schema **rethrows the `ZodError`** instead of returning field errors, so
   `handleSubmit` would throw rather than mark fields invalid. Zod 4 support landed in
   **resolvers 5.1.0**. Use **`^5.9.1`** (latest). Anything below 5.4.2 fails type-checking with
   `zod@>=4.3` ([#842](https://github.com/react-hook-form/resolvers/issues/842)).

3. **The real work comes from resolvers v5's input/output typing, not from Zod 4 itself.**
   Resolvers 5.0.0 made `zodResolver` return `Resolver<z.input<T>, Context, z.output<T>>`
   ([v5.0.0 release](https://github.com/react-hook-form/resolvers/releases/tag/v5.0.0)). Every form
   here calls `useForm<OutputType>(…)`, which assumes input ≡ output. Measured on
   **zod 3.25.76 + resolvers 5.9.1** (no Zod change at all): **4 tsc errors** in `ProductForm.tsx`
   and `LogWeightButton.tsx`. Zod 4's `z.coerce` input type becoming `unknown` adds **3 more**
   (`NoteForm.tsx`, `weightSchema.ts`).

4. **The whole migration is an 8-file, ~10-line diff, and it is measured green.** After the changes
   in §8, the copy gives `tsc` **0 errors**, `vitest` **154 passed / 2 skipped** (identical to the
   baseline), `eslint src` **0 errors** (14 warnings, all pre-existing `@eslint-react/*`), and
   `vite build` succeeds. The fixes:
   - `z.coerce.number()` → `z.coerce.number<number>()` (3 sites). This is
     [the documented way](https://zod.dev/api) to restore a typed input.
   - `weightSchema.ts:11`: `.pipe(z.coerce.number()…)` → `.pipe(z.number()…)`. The value piped in is
     already a `number`.
   - Drop the explicit generic from the 3 `useForm<…>` calls and let it infer from the resolver.
     This is what both the [resolvers README](https://github.com/react-hook-form/resolvers/blob/v5.9.1/README.md#zod)
     and Zod's author
     ([#781](https://github.com/react-hook-form/resolvers/issues/781)) prescribe.
   - Widen two props that claimed nutrition fields are always `number | null` to
     `string | number | null`. At runtime they hold strings once the user types.

5. **One user-visible change cannot be avoided: Zod's default English error messages were
   rewritten.** All of this repo's custom `message`s are unchanged, but every *default* message
   shown in a form's `helperText` changes. For example, the product-name `min(3)` message goes from
   `String must contain at least 3 character(s)` to
   `Too small: expected string to have >=3 characters`. Full list measured in §4.3. No test asserts
   on these strings. Accepting the new wording vs. pinning the old one is a product decision (§9).

6. **Recommendation: path (a), bump to `zod@^4.6.5`.** Do not take path (b) (stay on 3.25.x and
   import `zod/v4`). Inside 3.25.76, `zod/v4` is **frozen at 4.0.0**: its `v4/core/versions.js`
   reads `{major:4, minor:0, patch:0}`, vs `4.6.5` in the real package. Path (b) costs exactly the
   same code changes, and in return it gives a 15-month-old Zod 4 that never gets fixes, plus an
   import path that has to be rewritten later anyway. Details in §5.

7. **Tooling is a non-issue.** Zod needs TS ≥ 5.5 and `strict` (repo: 5.9.3, `strict: true`).
   `@typescript-eslint/no-deprecated` is **not enabled**: it lives in `strictTypeChecked`, and the
   config extends `recommendedTypeChecked`. So `z.nativeEnum` (deprecated in v4) produces no lint
   error. Zod Mini is irrelevant. Bundle: **+9.4 kB gzip total JS** (measured), so not a reason to
   migrate.

8. **Sizing: one small PR.** No reason to split it. Resolvers and Zod must land together, because
   resolvers 3.10 cannot run against Zod 4 and the generics fix is needed for resolvers 5 even on
   Zod 3.

---

## 2. Version reality check

### 2.1 Zod (verified from the registry)

| Fact | Value | Source |
|---|---|---|
| Latest | **4.6.5**, 2026-09-13 | `npm view zod dist-tags --json`, `npm view zod time --json` |
| First 4.x | **4.0.0**, 2025-07-09 | `npm view zod time --json` |
| Last 3.x | **3.25.76**, 2025-07-08 (only `3.26.0-canary.*` after it) | `npm view zod versions --json` |
| Repo pin | `^3.25.76` → installed 3.25.76 | `src/frontend/package.json:38`, `yarn.lock` |
| `zod/v4` inside 3.25.76 | **Zod 4.0.0** (`v4/core/versions.js`) | probe, `node_modules/zod/v4/core/versions.js` |
| `peerDependencies` / `engines` | none declared | `npm view zod@4.6.5 peerDependencies engines` |
| Subpath exports in 4.6.5 | `.`, `./v3`, `./v4`, `./mini`, `./v4/core`, `./v4-mini`, `./locales`, `./compile`, … | `npm view zod@4.6.5 exports --json` |
| Unpacked size | 3.59 MB (3.25.76) → 6.14 MB (4.6.5). Install size only, not bundle size | `npm view zod@<v> dist.unpackedSize` |

**Zod is already in the dependency tree at v4.** `yarn why zod` (repo, today):
`@eslint-react/shared@5.19.1` → `zod@4.4.3` (via `^3.25.0 || ^4.0.0`). It is a devDependency of
the ESLint plugin and never reaches the app bundle. After the bump the tree holds two dev-time
copies (4.4.3 + 4.6.5). `yarn dedupe zod` would collapse them to 4.6.5. This is optional and
cosmetic.

**The `npmMinimalAgeGate: 7d` in `.yarnrc.yml` is satisfied** by both targets (zod 4.6.5 is
21 days old; resolvers 5.9.1 is 48 days old).

### 2.2 `@hookform/resolvers`

| Fact | Value | Source |
|---|---|---|
| Latest | **5.9.1**, 2026-08-17 | `npm view @hookform/resolvers dist-tags --json` |
| Repo pin | `^3.10.0` → 3.10.0 (2025-01-06) | `src/frontend/package.json:21` |
| First with Zod 4 | **5.1.0** (2025-06-07): *"support Zod 4, Zod v4 mini, and retains compatibility with Zod v3"* | [v5.1.0](https://github.com/react-hook-form/resolvers/releases/tag/v5.1.0) |
| Needed for `zod >= 4.3` | **5.4.2**: type overloads used Zod's branded `_zod.version.minor` literal | [v5.4.2](https://github.com/react-hook-form/resolvers/releases/tag/v5.4.2), [#842](https://github.com/react-hook-form/resolvers/issues/842) |
| 5.9.1 peers | `react-hook-form: ^7.55.0`; `zod: ^3.25.0 \|\| ^4.0.0` (**optional**, since 5.4.1) | `npm view @hookform/resolvers@5.9.1 peerDependencies peerDependenciesMeta --json` |
| 3.10.0 peers | `react-hook-form: ^7.0.0` | same |
| Repo `react-hook-form` | `^7.88.0` → 7.88.0 ✅ satisfies `^7.55.0` | `src/frontend/package.json:33` |
| Open issues on the repo | **0** (`open_issues_count: 0`) | `gh api repos/react-hook-form/resolvers` |

---

## 3. Inventory of current usage

`rg "from 'zod|@hookform/resolvers" src/frontend` → **10 source files**, no hits in
`src/frontend/tests/` (MSW mocks, render helpers), none in the root `tests/` E2E workspace, and none
in any `.md` outside `.scratch/`. The only other hits are JSDoc `@deprecated Use react-hook-form + zod
instead` on `src/shared/hooks/useInput.tsx:21,30` (prose, no import).

All imports are `import { z } from 'zod'`. No `zod/v3`, `zod/v4` or `zod/mini` imports.

### 3.1 Schemas (paths relative to `src/frontend/`)

| File | Zod APIs used |
|---|---|
| `src/shared/lib/quantitySchema.ts:3` | `z.coerce.number().int().min(10).max(1000)` |
| `src/entities/product/model/NutritionValueSchema.ts:3-17` | `z.union([z.string(), z.number(), z.null()])` → `.transform` → `.refine(fn, { message })` (:6-8) → `.transform` → `.pipe(z.number().min(0).max(1000).nullable())` (:17) |
| `src/entities/product/model/productSchema.ts:5-24` | `z.object`; `z.number().optional()` (:6); `z.string().min(3).max(100)` (:7); `quantitySchema` (:8); nested `z.object(…).nullable().refine((c): boolean => c !== null, { message })` (:9-15); **`z.coerce.number().int().min(1).max(1000)`** (:16); `NutritionValueSchema` ×5; `z.infer` (:24) |
| `src/features/manageNote/model/noteSchema.ts:5-29` | `z.object`; `z.number().nullable()` ×5; `z.string()`; **`z.nativeEnum(noteModel.MealType)`** (:20); **`z.coerce.number().int().min(0)`** (:21); `.nullable().refine((p): boolean => p !== null, { message })` (:22-24); `z.infer` ×2 (:28-29) |
| `src/features/logWeight/model/weightSchema.ts:3-12` | `z.string().or(z.number())` → `.transform` → `.refine(fn, { message })` → `.transform` → **`.pipe(z.coerce.number().gte(1).lte(500))`** (:11) → `.refine(fn, { message })` (:12) |
| `src/features/logWeight/model/index.ts:4-9` | `z.object`, `z.date()`, `z.infer` |
| `src/entities/note/lib/mealsHelpers.ts:23,26` | **`z.nativeEnum(MealType)`** + `.parse(Number(key))`. `MealType` is a **numeric** TS enum (`entities/note/model/types.ts:1-7`) |

### 3.2 Resolver call sites

| File | Usage |
|---|---|
| `src/entities/product/ui/ProductForm.tsx:1,57-61,90` | `useForm<ProductFormValues>({ resolver: zodResolver(productSchema), defaultValues })`; `handleSubmit(data => onSubmit(data))` |
| `src/features/manageNote/ui/NoteForm.tsx:1,57-61,92` | `useForm<NoteFormValues>({ resolver: zodResolver(noteSchema), defaultValues })` |
| `src/features/logWeight/ui/LogWeightButton.tsx:1,33-40,44,77` | `useForm<FormValues>({ resolver: zodResolver(schema), … })`; `SubmitHandler<FormValues>` |

None pass `schemaOptions` or `resolverOptions` (`raw`, `mode`) to `zodResolver`.

### 3.3 Direct parsing in tests

- `src/entities/product/model/NutritionValueSchema.test.ts:16,25`: `.safeParse` → `success`, `data`
- `src/features/logWeight/model/weightSchema.test.ts:18`: `.safeParse` → `success`, `data`

### 3.4 APIs confirmed **not** used (`rg` count = 0 across `src/` and `tests/`)

`.email()` / `.uuid()` / `.url()` / `.ip()` / `.cidr()`, `.superRefine`, `errorMap`,
`invalid_type_error`, `required_error`, `.default()`, `.merge()`, `.extend()`, `.partial()`,
`.strict()`, `.passthrough()`, `.nonempty()`, `ZodError`, `.format()`, `.flatten()`, `.errors`,
`ZodType`/`ZodTypeAny`, `z.input`/`z.output`, `z.record`, `z.function`, `z.promise`,
`z.preprocess`, `z.discriminatedUnion`, `z.literal`, `z.enum`, `z.array`, `z.any`/`z.unknown`,
`z.intersection`/`.and()`, `.brand()`, `z.config`, `.catch()` (the one `.catch(` hit is a Promise in
`ImageViewer.tsx:36`).

---

## 4. Breaking changes vs this codebase

Guide: <https://zod.dev/v4/changelog>
Raw: <https://raw.githubusercontent.com/colinhacks/zod/main/packages/docs/content/v4/changelog.mdx>

### 4.1 Changes that hit this repo

| # | v4 change (guide section) | Call sites | Effect | Fix |
|---|---|---|---|---|
| 1 | **`z.coerce` input type is now `unknown`** (§ `z.coerce` updates) | `quantitySchema.ts:3`, `productSchema.ts:16`, `noteSchema.ts:21`, `weightSchema.ts:11` | **tsc errors (measured).** `NoteForm.tsx:59` resolver mismatch (`quantity`, `displayOrder`, `product.defaultQuantity` all `unknown`); `weightSchema.ts:11` `ZodCoercedNumber<unknown>` not assignable to the pipe's `$ZodType<any, number>` | `z.coerce.number<number>()`. Docs: *"The input type of these coerced schemas is `unknown` by default. To specify a more specific input type, pass a generic parameter"* ([api § Coercion](https://zod.dev/api), `api.mdx:50-56`). For `weightSchema.ts:11` use plain `z.number()`, because the preceding `.transform` already returns `number` |
| 2 | **`ZodError.errors` dropped** (§ drops `.errors`) | none directly. **`@hookform/resolvers@3.10.0` relies on it** | **Runtime break (measured)**: the 3.10 resolver rethrows the `ZodError` | Bump resolvers to `^5.9.1` (§6) |
| 3 | **Default error messages rewritten** (not listed as a breaking change in the guide; measured) | every `fieldState.error?.message` that isn't a custom `message` | **User-visible text change** (§4.3) | Accept, or override (§9 Q1) |
| 4 | `z.nativeEnum()` deprecated in favour of `z.enum()` (§ `z.nativeEnum()` deprecated) | `mealsHelpers.ts:23`, `noteSchema.ts:20` | **None at runtime.** Measured on 4.6.5 with a numeric enum: `z.nativeEnum(M).options` → `[1, 3]`, `.safeParse(1)` ✅, `.safeParse('Breakfast')` ❌. Same as v3. Marked `@deprecated` in `v4/classic/schemas.d.ts:613-620` | Optional: `z.enum(MealType)` (identical behaviour, same `.options`) |
| 5 | `message` param deprecated in favour of `error` (§ deprecates `message` parameter: *"still supported but deprecated"*) | `NutritionValueSchema.ts:7`, `productSchema.ts:15`, `noteSchema.ts:24`, `weightSchema.ts:8,12` | **None.** Measured: all 5 custom messages surface verbatim on 4.6.5. `message?:` carries `@deprecated` in `v4/core/api.d.ts:9` | Optional: `{ message: … }` → `{ error: … }` |
| 6 | String `.min()`/`.max()` count **code points**, not UTF-16 units (Zod **4.5**, [blog § String length counts code points](https://raw.githubusercontent.com/colinhacks/zod/main/packages/docs/content/blog/zod-4-5.mdx)) | `productSchema.ts:7` (`name: min(3).max(100)`) | **Edge-case drift from the backend.** `ProductCreateEditRequest.cs:10` uses `[StringLength(100, MinimumLength = 3)]`, which counts UTF-16 units. A name with astral chars (emoji) can now pass the frontend and get a 400 from the API (`max`), or get rejected only client-side (`min`). Measured: `z.string().max(3).parse("😀😀😀")` was `too_big` on 3.25.76 and is OK on 4.6.5 | Accept; theoretical for a personal food log |

### 4.2 Changes checked and found **not** to affect this repo

| v4 change | Why not |
|---|---|
| `invalid_type_error` / `required_error` / `errorMap` dropped | 0 uses (§3.4) |
| Error-map precedence change | No schema-level or parse-level error maps |
| `.format()` / `.flatten()` deprecated, `.formErrors` dropped, `.addIssue()` deprecated | 0 uses |
| Issue format changes (`invalid_date` merged into `invalid_type`, etc.) | Nothing inspects `issue.code`. The resolver passes the code through as `FieldError.type`, and nothing reads `.type` |
| `z.number()` rejects ±Infinity; `.int()` safe integers only; `.safe()` | Every number is bounded (`max(1000)`, `lte(500)`), so these values were already rejected |
| `z.coerce` missing key now errors | All coerced fields are required keys of the form types, so `defaultValues` always supply them. (In v3, `Number(undefined)` = `NaN` failed anyway) |
| `.default()` short-circuits / `.prefault()` | 0 uses |
| Defaults applied inside optional fields | 0 `.default()` |
| `.strict()` / `.passthrough()` / `.strip()` / `.merge()` deprecated; `.deepPartial()` / `.nonstrict()` dropped | 0 uses |
| `z.unknown()` / `z.any()` key optionality (and v4.4 parse-time soundness fix) | 0 uses |
| String format methods (`.email()` etc.) deprecated; stricter `.uuid()`, `.ipv6()`, `base64url`; `.ip()`/`.cidr()` dropped | 0 uses |
| `.nonempty()` type change, `z.record` single-arg, `z.function`, `z.promise`, `z.literal(symbol)`, static `.create()`, `z.ostring()` | 0 uses |
| `z.intersection` throws `Error` on merge conflict | 0 uses |
| `.refine()` ignores type predicates | Both `.refine`s on nullable objects annotate the return type as `: boolean` (`productSchema.ts:15`, `noteSchema.ts:24`), so they never narrowed. (4.6.5's `refine` typing at `schemas.d.ts:41` does narrow on predicates again, which is irrelevant here) |
| `.refine()` drops `ctx.path` and the function-as-second-arg overload | No `superRefine`, all second args are objects |
| `ZodEffects` dropped, `.transform()` now returns `ZodPipe` (internal) | Measured on both chained schemas with failing inputs (`'asd'`, `''`, `'12,'`, `'600'`, `'1.234'`, `'-1'`, `'100500'`, `undefined`): **the same issues and paths** on 3.25.76 and 4.6.5; only default-message wording differs |
| `ZodType` generics change (`Def` removed, `Input` defaults to `unknown`), `._def` → `._zod.def` | 0 references to `ZodType` / `_def` |
| Zod 4.5: `z.iso.datetime()` needs seconds, `__proto__` stripped, record/intersection semantics, stricter formats | 0 uses |
| Zod 4.6: error maps run lazily on first read of `result.error` ([blog](https://raw.githubusercontent.com/colinhacks/zod/main/packages/docs/content/blog/zod-4-6.mdx)); `z.emoji()` stricter | No `z.config()` / locale swapping; no `z.emoji()` |

### 4.3 Default-message changes (measured, 3.25.76 → 4.6.5)

Messages these exact schemas produce, i.e. what a user would see in the form's `helperText`:

| Field / input | Zod 3.25.76 | Zod 4.6.5 |
|---|---|---|
| Product name `"A"` (`min(3)`) | `String must contain at least 3 character(s)` | `Too small: expected string to have >=3 characters` |
| Product name 101 chars | `String must contain at most 100 character(s)` | `Too big: expected string to have <=100 characters` |
| Calories `"0"` / `""` | `Number must be greater than or equal to 1` | `Too small: expected number to be >=1` |
| Calories `"abc"` | `Expected number, received nan` | `Invalid input: expected number, received NaN` |
| Calories `"1.5"` | `Expected integer, received float` | `Invalid input: expected int, received number` |
| Quantity / default quantity `"0"` | `Number must be greater than or equal to 10` | `Too small: expected number to be >=10` |
| Quantity `"5000"` | `Number must be less than or equal to 1000` | `Too big: expected number to be <=1000` |
| Nutrition value `"100500"` | `Number must be less than or equal to 1000` | `Too big: expected number to be <=1000` |
| Weight `"600"` | `Number must be less than or equal to 500` | `Too big: expected number to be <=500` |
| Weight date = `Invalid Date` | `Invalid date` | `Invalid input: expected date, received Date` |
| Category object missing | `Required` | `Invalid input: expected object, received undefined` |
| **All custom `message`s** (category/product required, nutrition/weight format) | unchanged | **unchanged** |

`rg` over `*.test.*` and `*.fixture.*` finds no assertion on any of these strings. The product dialog
tests assert `toBeInvalid()` only (`ProductInputDialog.fixture.tsx:238-268`), which is why the suite
stays green.

---

## 5. Upgrade paths

### (a) `zod@^4.6.5`, keep `import { z } from 'zod'`

- The package root exports Zod 4 since 4.0.0: *"The package root (`"zod"`) now exports Zod 4. All
  other subpaths have not changed and will remain available forever"*
  ([versioning](https://zod.dev/v4/versioning), `v4/versioning.mdx:10-12`).
- No import rewrites: every file already imports from the root.
- Gets every 4.x fix to date (4.0.1 → 4.6.5).
- Resolvers 5.9.1 detects Zod 4 by the `_zod` marker (`isZod4Schema`, `zod.ts:36-38`) and types it
  through a minimal `Zod4Type` interface. That interface was added specifically so that
  *"zod v4 patch/minor releases, which brand the full `$ZodType` shape with an exact version
  literal"* don't break the overloads ([zod.ts:185-193](https://github.com/react-hook-form/resolvers/blob/v5.9.1/zod/src/zod.ts)).

### (b) Stay on `zod@3.25.76`, import from `zod/v4`

- Technically supported: resolvers' peer range is `^3.25.0 || ^4.0.0`, and the versioning page says
  `"zod/v4"` *"will remain available forever"*.
- **But the `zod/v4` inside 3.25.76 is Zod 4.0.0, frozen** (`node_modules/zod/v4/core/versions.js`:
  `{ major: 4, minor: 0, patch: 0 }`). No 3.25.x has shipped since 2025-07-08, so this copy will
  never get a fix. The versioning page itself describes the subpath scheme as a transition device
  for **library authors**: *"Ultimately, the subpath versioning scheme was a necessary evil to force
  the ecosystem to upgrade in a non-breaking way"* (`v4/versioning.mdx:46`). An application has no
  peer-range constraint to protect.
- It needs **the same code changes** as (a): coerce input, resolver generics, the resolver bump.
  Then a second churn later to move `zod/v4` → `zod`.
- It would also put Zod 3 (root) and Zod 4 (subpath) in the same install, which invites accidental
  root imports from new code.

### Recommendation: **(a)**

(b) has no upside for an application: identical cost, a frozen 4.0.0, and guaranteed rework. The
only reason to use subpaths is to support two Zod majors at once, and this repo has one consumer.

---

## 6. `@hookform/resolvers` 3.10.0 → 5.9.1

### 6.1 Changelog walk (every release between, from GitHub releases)

| Version | Change | Affects us? |
|---|---|---|
| [4.0.0](https://github.com/react-hook-form/resolvers/releases/tag/v4.0.0) | BREAKING: **AJV** resolver unwraps `errorMessage`. Adds `names` option support, `raw: true` fix, standard-schema resolver | ❌ No AJV, no `raw` |
| [4.1.0](https://github.com/react-hook-form/resolvers/releases/tag/v4.1.0) | *"automatically infer values from schema"* | Groundwork for 5.0 |
| 4.1.1 – 4.1.3 | standard-schema fixes; `@standard-schema/utils` moved to `dependencies` | ❌ |
| [**5.0.0**](https://github.com/react-hook-form/resolvers/releases/tag/v5.0.0) | **BREAKING: requires `react-hook-form@7.55.0+`; infers input/output types from schema.** *"Prior to V5, some projects used manual types like `useForm<FormValues>()`. With V5, the correct approach is `useForm<Input, Context, Output>()` … The best approach is to let the types be inferred from your schema"* | ✅ **Yes.** All 3 forms (§6.2). RHF 7.88 ✅ |
| 5.0.1 | peer relaxed to `^7.55.0` | — |
| [**5.1.0**](https://github.com/react-hook-form/resolvers/releases/tag/v5.1.0) | **Zod 4 + Zod Mini support**, Zod 3 retained | ✅ minimum for Zod 4 |
| 5.1.1, 5.2.1, 5.2.2 | Zod peer-dep fixes; *"fix output type for Zod 4 resolver"* ×2 | ✅ fixes we want |
| 5.2.0 | ajv-formats | ❌ |
| [5.4.0](https://github.com/react-hook-form/resolvers/releases/tag/v5.4.0) | ata-validator resolver; `toNestErrors` fix (no `5.3.0` exists on npm or in GitHub releases) | — |
| 5.4.1 | validation libraries declared as **optional** peers | ✅ removes peer warnings |
| [**5.4.2**](https://github.com/react-hook-form/resolvers/releases/tag/v5.4.2) | **`zodResolver()` overload fails with Zod v4.3.x** ([#842](https://github.com/react-hook-form/resolvers/issues/842)): *"The types of '_zod.version.minor' are incompatible"* | ✅ **required for zod ≥ 4.3** |
| 5.4.3 | Zod resolver respects union errors (closest branch) | ✅ `NutritionValueSchema` is a union, but a non-matching *type* never reaches it from a text field |
| 5.5.0 | TypeScript 6 support | — |
| 5.5.1 | nested discriminated unions (Zod 4) | ❌ |
| 5.5.2 | Zod 4 locale / global error customization picked up | Only if we adopt `z.config` (§9 Q1) |
| 5.5.3 | dynamic schema resolution regression fix | ❌ |
| 5.5.6 | *"module not found when importing zodResolver under Zod v3"* | Relevant only to path (b)-style setups |
| 5.5.8, 5.6.0, 5.9.1 | errors for special root field names (`toString`, `constructor`…); bracket-notation array paths | ❌ |
| 5.5.4, 5.5.5, 5.5.7, 5.7.x, 5.8.0, 5.9.0 | AJV, yup, valibot, vine, vest, joi | ❌ |

**Runtime contract unchanged for us:** both 3.10 (`zod.ts:71`) and 5.9.1 (`zod.ts:325`) return the
**parsed (transformed) output** as `values` unless `raw: true`. `onSubmit` keeps receiving numbers.

### 6.2 Why `useForm<Output>` breaks, and the two documented fixes

3.10's resolver was generic in `TFieldValues` and never checked it against the schema
(`zod/src/types.ts:4-22`). That is the only reason `useForm<ProductFormValues>` (an **output** type)
compiled. 5.9.1's Zod 4 overload returns `Resolver<z4.input<T>, Context, z4.output<T>>`
(`zod.ts:243-252`). Wherever input ≠ output, a single generic is now a type error:

- `NutritionValueSchema`: input `string | number | null`, output `number | null`. This breaks
  `ProductForm` **even on Zod 3**.
- `weightSchema`: input `string | number`, output `number`. This breaks `LogWeightButton` **even on
  Zod 3**.
- `z.coerce.number()`: input `unknown` on Zod 4. This breaks `NoteForm`.

The resolvers README spells out both fixes
([README § Zod](https://github.com/react-hook-form/resolvers/blob/v5.9.1/README.md#zod), lines
233-238): *"Passing a single generic to `useForm<T>` pins both to the same type and will conflict
with `zodResolver`, which infers input and output separately. Either omit the generic and let it
infer from `resolver`, or specify all three explicitly: `useForm<z.input<typeof schema>, unknown,
z.output<typeof schema>>`"*. Colin McDonnell (Zod's author) on
[#781](https://github.com/react-hook-form/resolvers/issues/781): *"don't pass an explicit generic to
`useForm<>` anymore … the code example from the website (`useForm<z.infer<typeof schema>>(…)`) is
unsound and assumes the input & output types are identical. … The Zod 4 changes to `z.coerce` change
is now revealing this issue for more people."* He suggests `z.coerce.string<string>()` to pin a
coerced input.

**Both variants were measured, and both give 0 tsc errors** (with the two prop widenings below):

| Variant | Extra code |
|---|---|
| **Omit the generic** (`useForm({ resolver: zodResolver(schema), defaultValues })`) | none |
| Three explicit generics | needs new exported `ProductFormInput` / `FormInput` types (`z.input<…>`) and longer `useForm` lines that Prettier wraps |

Recommend **omit the generic**: less code, and it is what both sources recommend. `defaultValues`
typed as the output type still type-checks against the inferred input type, because output ⊂ input
for every field.

### 6.3 The two props that were lying

Once field values are typed as the schema **input**, two pre-existing declarations no longer hold
(measured, `ProductForm.tsx:77` and `:233`):

- `src/entities/product/lib/useNutritionSuggestions.ts:8`: `getFieldValue: (field) => number | null`
- `src/entities/product/ui/NutritionValueInput.tsx:11`: `value: number | null`

Both receive the raw form value of a nutrition field. After the user types into a MUI `TextField`,
that value is a **string** (RHF `Controller` stores `event.target.value`). Widening both to
`string | number | null` is the honest fix, and it is all `tsc` needs.

Side observation, **not verified at runtime and out of scope**: `useNutritionSuggestions.ts:45`
checks `getFieldValue(field) === null` to decide whether an empty field can be auto-filled. A field
the user typed into and then cleared holds `''`, not `null`, so it would not count as empty. The new
types surface this; the migration does not change it.

### 6.4 Known issues

- Every Zod-4 + `z.coerce` type-mismatch report in the resolvers tracker is **closed** with the
  guidance above: [#781](https://github.com/react-hook-form/resolvers/issues/781),
  [#794](https://github.com/react-hook-form/resolvers/issues/794),
  [#795](https://github.com/react-hook-form/resolvers/issues/795),
  [#815](https://github.com/react-hook-form/resolvers/issues/815),
  [#830](https://github.com/react-hook-form/resolvers/issues/830).
- The resolvers repo has **0 open issues** today. react-hook-form
  [#13109](https://github.com/react-hook-form/react-hook-form/issues/13109) ("inferred form types
  from zod schema are not correct when using zod v4") is closed.

---

## 7. Tooling interactions

| Topic | Finding | Source |
|---|---|---|
| **TypeScript** | *"Zod is tested against TypeScript v5.5 and later"*, and `strict` is required. Repo: `typescript: 5.9.3` (`package.json:65`), `"strict": true` (`tsconfig.json:14`) ✅. Resolvers 5.5.0 added TS 6 support, so a future TS 6 bump is unblocked | [zod.dev § Requirements](https://zod.dev/), `index.mdx:119-135`; [v5.5.0](https://github.com/react-hook-form/resolvers/releases/tag/v5.5.0) |
| **`@typescript-eslint/no-deprecated`** | **Not enabled.** It is in `strict-type-checked` only (verified in `node_modules/@typescript-eslint/eslint-plugin/dist/configs/flat/strict-type-checked.js:34`, absent from `recommended-type-checked.js`), and `eslint.config.js:19` extends `recommendedTypeChecked`. With the rule forced on ad hoc, the only Zod hits are `nativeEnum` ×2 (`mealsHelpers.ts:23`, `noteSchema.ts:20`). The deprecated `message` keys in object literals were **not** flagged | probe |
| Other ESLint rules | `yarn eslint src` on the migrated copy: **0 errors**, 14 warnings, all pre-existing `@eslint-react/set-state-in-effect` / `use-state` / `no-array-index-key`. `strict-boolean-expressions` has nothing new to flag | probe |
| **Bundle size** | `vite build` total JS: **713.07 → 722.49 kB gzip (+9.4 kB)**, raw 2268.8 → 2297.0 kB. Zod lives in the `store-*` chunk (368.4 → 398.0 kB raw). Rollup re-chunked (58 → 56 chunks), so compare totals, not per-chunk sizes. Zod's "2x smaller core bundle" headline is for a `z.boolean().parse()` micro-script ([v4 release notes § 2x reduction in core bundle size](https://zod.dev/v4)), not for a classic-API app like this one. Why it grew here was **not investigated** | probe |
| **Zod Mini** | Not relevant. The docs say *"you should probably use regular Zod unless you have uncommonly strict constraints around bundle size"*; it changes the API to functional `.check()` style and ships **no default locale**. Resolvers supports it, but the rewrite isn't worth ~10 kB for a self-hosted PWA | [zod.dev/packages/mini § When (not) to use](https://zod.dev/packages/mini) |
| JIT / CSP | Zod 4 probes `new Function` for its object fast-path (`v4/core/util.js:218-229`) and falls back silently. `rg -i "content-security-policy\|unsafe-eval"` over the repo finds **no CSP**, so nothing to configure | probe |
| Browser targets | `vite build` with the repo's `browserslist.production` (Chrome ≥117 etc.) succeeds with Zod 4.6.5 | probe |
| Unofficial codemod | [`zod-v3-to-v4`](https://github.com/nicoespeon/zod-v3-to-v4) is linked from the guide as community-maintained. **Not worth it** for ~10 hand edits; not evaluated | changelog.mdx:29-31 |

---

## 8. Proposed migration steps

All commands run from `src/frontend/`. One PR.

0. **Pre-flight: re-sync `node_modules`.** `yarn install`. The local `node_modules` is **out of sync
   with `yarn.lock`**: it has `react-router@8.4.0` installed while the lockfile pins `7.18.4`. That
   produces 5 spurious `no-unsafe-*` lint errors in `src/widgets/Navigation/ui/Navigation.tsx` on
   the untouched baseline. This has nothing to do with Zod, but it would muddy the before/after
   comparison. Verify: `yarn lint` → 0 errors before starting.

1. **Bump both packages together.**
   `yarn add zod@^4.6.5 @hookform/resolvers@^5.9.1` (optionally `yarn dedupe zod`).
   Verify: `yarn build`. Expect exactly the 7 tsc errors from §1.3, which confirms the inventory.

2. **Pin the coerced inputs** (3 files):
   ```ts
   // shared/lib/quantitySchema.ts:3, productSchema.ts:16, noteSchema.ts:21
   z.coerce.number<number>()…
   ```
   and in `features/logWeight/model/weightSchema.ts:11`:
   ```ts
   .pipe(z.number().gte(1).lte(500))
   ```
   Verify: `yarn build`. `NoteForm` and `weightSchema` errors are gone; 4 remain in
   `ProductForm` / `LogWeightButton`.

3. **Drop the explicit `useForm` generics** in `ProductForm.tsx:57`, `NoteForm.tsx:57` and
   `LogWeightButton.tsx:33` (`useForm<X>({` → `useForm({`). Verify: `yarn build`. 2 errors remain
   (`ProductForm.tsx:77,233`).

4. **Widen the two value types** to `string | number | null`:
   `useNutritionSuggestions.ts:8` (`getFieldValue` return) and `NutritionValueInput.tsx:11`
   (`value`). Verify: `yarn build` → green.

5. **Optional, same PR: clear the v4 deprecations.** `z.nativeEnum(X)` → `z.enum(X)` (2 sites) and
   `{ message: … }` → `{ error: … }` (5 sites). Behaviour is identical. Skip this if you'd rather keep
   the diff minimal; nothing lints for it today.

6. **Full verification.** `yarn test` (expect 154 passed / 2 skipped, same as baseline),
   `yarn lint`, `yarn format:check`, `yarn build`. Then click through product add/edit, note
   add/edit and log weight with bad input in the dev server (`yarn start` with MSW, see
   `docs/development.md`) to see the new default messages (§4.3) in place.

7. **Docs.** `CLAUDE.md:11,86` and `README.md` mention "react-hook-form + Zod" without a version, so
   nothing to update. Call out the changed validation wording in the PR description / next
   `CHANGELOG.md` entry, because it is user-visible.

Expected final diff (measured in the probe, before optional step 5): 8 files under `src/`, plus
`package.json` and `yarn.lock`.

---

## 9. Risks & open questions

1. **Default error wording (user-visible).** Zod 4's defaults (`Too small: expected number to be
   >=10`) are more technical than v3's. Options:
   - (i) accept them;
   - (ii) give the handful of user-facing checks explicit `error` strings;
   - (iii) install a global `z.config({ customError })` map
     ([error-customization § Global error customization](https://zod.dev/error-customization)).
     Resolvers ≥5.5.2 honours this.

   (i) is the minimal-tool default, and nothing tests the wording. This is a product call, not a
   research gap.
2. **Product-name length drift vs the backend** (§4.1 #6): Zod ≥4.5 counts code points, while .NET
   `StringLength` counts UTF-16 units. Only reachable with emoji or other astral characters in a
   name. Accept, or align later if it ever bites.
3. **Latent empty-field check in `useNutritionSuggestions`** (§6.3). It is surfaced by the honest
   types, not caused by the migration. Worth its own `.scratch` issue if confirmed.
4. **Bundle +9.4 kB gzip.** Small, but this is the opposite of the headline claim. Not
   investigated. If it matters, `rollup-plugin-visualizer` on both builds would show where it comes
   from.
5. **Measurement scope.** All "measured" results are from `vitest` (jsdom) + `tsc` + `eslint` +
   `vite build` on a copy. The browser was **not** exercised. The only behaviour change found
   (message text) is runtime-only and covered by step 6's manual pass.

---

## 10. Sources

### Zod docs (zod.dev; raw source under `colinhacks/zod/packages/docs/content/`)
- v4 migration guide / changelog — https://zod.dev/v4/changelog · raw: https://raw.githubusercontent.com/colinhacks/zod/main/packages/docs/content/v4/changelog.mdx
- Versioning (root export switch, subpaths "forever", the 3.25 scheme) — https://zod.dev/v4/versioning · raw: https://raw.githubusercontent.com/colinhacks/zod/main/packages/docs/content/v4/versioning.mdx
- Library authors (`zod/v4/core` permalink, `^3.25.0 || ^4.0.0`) — https://zod.dev/library-authors
- Zod 4 release notes (bundle-size methodology) — https://zod.dev/v4
- Requirements (TS ≥ 5.5, `strict`) — https://zod.dev/
- API § Coercion (`z.coerce.number<number>()`) — https://zod.dev/api · raw: https://raw.githubusercontent.com/colinhacks/zod/main/packages/docs/content/api.mdx
- Error customization (`error` param, `z.config({ customError })`, locales) — https://zod.dev/error-customization
- Zod Mini — https://zod.dev/packages/mini
- Zod 4.5 release post (code-point string length, other ⚠️ fixes) — https://raw.githubusercontent.com/colinhacks/zod/main/packages/docs/content/blog/zod-4-5.mdx
- Zod 4.6 release post (lazy error maps) — https://raw.githubusercontent.com/colinhacks/zod/main/packages/docs/content/blog/zod-4-6.mdx
- `v3.25.76` / `v4.6.5` GitHub releases — https://github.com/colinhacks/zod/releases

### `@hookform/resolvers`
- Releases v4.0.0 → v5.9.1 — https://github.com/react-hook-form/resolvers/releases
- v5.0.0 (input/output inference, RHF ≥ 7.55) — https://github.com/react-hook-form/resolvers/releases/tag/v5.0.0
- v5.1.0 (Zod 4 support) — https://github.com/react-hook-form/resolvers/releases/tag/v5.1.0
- v5.4.2 (Zod 4.3 overload fix) — https://github.com/react-hook-form/resolvers/releases/tag/v5.4.2
- `zodResolver` source @ v5.9.1 — https://github.com/react-hook-form/resolvers/blob/v5.9.1/zod/src/zod.ts
- README @ v5.9.1, Zod section (generic guidance) — https://github.com/react-hook-form/resolvers/blob/v5.9.1/README.md#zod
- #781 (colinhacks: drop the `useForm` generic; `z.coerce.string<string>()`) — https://github.com/react-hook-form/resolvers/issues/781
- #842 (branded version mismatch with Zod 4.3) — https://github.com/react-hook-form/resolvers/issues/842
- #794, #795, #815, #830 (coerce type mismatch duplicates, closed) — https://github.com/react-hook-form/resolvers/issues
- 3.10.0 source (`isZodError` on `.errors`; unchecked `TFieldValues` generic) — installed copy, `src/frontend/node_modules/@hookform/resolvers/zod/src/{zod,types}.ts`

### Other
- react-hook-form #13109 — https://github.com/react-hook-form/react-hook-form/issues/13109
- `zod-v3-to-v4` community codemod — https://github.com/nicoespeon/zod-v3-to-v4

### Registry commands used
```
npm view zod dist-tags --json
npm view zod time --json
npm view zod versions --json
npm view zod@4.6.5 peerDependencies engines exports --json
npm view zod@{3.25.76,4.6.5} dist.unpackedSize
npm view @hookform/resolvers dist-tags --json
npm view @hookform/resolvers time --json
npm view @hookform/resolvers@<v> peerDependencies peerDependenciesMeta dependencies --json   # 3.10.0, 4.1.3, 5.0.0 … 5.9.1
gh release list|view -R react-hook-form/resolvers
gh api repos/react-hook-form/resolvers/contents/zod/src/zod.ts?ref=v5.9.1
gh api repos/colinhacks/zod/contents/packages/docs/content/<page>.mdx?ref=main
yarn why zod
```

---

## Appendix: how the probe was run

Nothing was installed into the repo and no repo source file was modified. `src/frontend` (including
`node_modules`) was APFS-cloned into the session scratchpad
(`/private/tmp/claude-501/.../scratchpad/probe/`) three times:

| Copy | Change | Used for |
|---|---|---|
| `baseline` | none | `vitest` (154 passed / 2 skipped), `vite build` size baseline |
| `frontend-v3r5` | `yarn add @hookform/resolvers@^5.9.1` (zod stays 3.25.76) | isolating resolver-only tsc errors (4); v3 default messages |
| `frontend-v4` | `yarn add zod@^4.6.5 @hookform/resolvers@^5.9.1`, then the §8 edits | everything else |

Commands run in each copy: `npx tsc --noEmit -p .`, `CI=true yarn vitest run`, `yarn eslint src`
(plus once with `--rule '{"@typescript-eslint/no-deprecated":"error"}'`), and `npx vite build`.
Default-message and schema-behaviour tables come from small Node scripts that rebuild the repo's
schemas verbatim and print `safeParse(...).error.issues` under each Zod version. The resolver
runtime check loaded the 3.10.0 `zod.js` from `baseline` against a Zod 4.6.5 schema:

```
THREW ZodError Too small: expected string to have >=3 characters          # resolvers 3.10.0 + zod 4
5.9.1 resolved {"values":{},"errors":{"name":{"message":"Too small: …","type":"too_small"}}}
```

`yarn add` in the copies also re-linked `node_modules` to `yarn.lock`. That is why the
`Navigation.tsx` `no-unsafe-*` errors show up in `baseline` (stale `react-router@8.4.0`) and not in
`frontend-v4`. The same 5 errors reproduce when ESLint runs on that file in the real repo, which
confirms the local `node_modules` drift noted in §8 step 0.

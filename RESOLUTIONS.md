# Yarn Resolutions

This file documents every entry in the `resolutions` block of `package.json`, every direct dependency held at an exact version because of a vulnerability decision, and every finding left open. Each entry answers three questions: **what is being pinned**, **why it exists**, and **when it can be removed**.

`package.json` doesn't allow comments, so this file is the only place that knowledge lives. **If you add or remove a resolution, update this file in the same commit.**

Based on the conventions of [dhis2-app-skeleton](https://github.com/EyeSeeTea/dhis2-app-skeleton/blob/master/RESOLUTIONS.md). Process: [internal wiki](https://github.com/EyeSeeTea/internal-know-how/wiki/Resolving-Dependency-Vulnerabilities).

## Conventions

- **`^` range or exact version?** A _floor_ ("never below this") takes a `^` range. Almost every security pin is a floor. A _fixture_ ("exactly this") takes an exact version and is a compatibility constraint, not a security one. An exact version where a floor belonged decays: nothing can ever patch it. If you cannot state the condition for unpinning an exact version, it should probably have been a `^` range.
- **A floor names the version that fixes every advisory it covers.** Take the highest patched version on the line, not the first one found.
- Prefer **per-parent** paths (`parent/child`) over standalone descriptors. Yarn only matches a standalone descriptor on exact text.
- **A versioned-parent path such as `execa@npm:0.7.0/cross-spawn` is keyed on the resolved version of the parent.** When the parent moves to another version it matches nothing and yarn does not warn. Re-check it at every audit.
- **Prefer re-resolution to a new constraint.** Most transitive findings are a stale lockfile: `yarn up -R <package>` reaches the patched release with no manifest change. Reach for a resolution only once that has been shown to fail.
- **Test a constraint by removing it, re-installing and comparing the _resolved versions_**, not the lockfile bytes. Every entry below was tested that way on 2026-11-20: removing it changed at least one resolved version.
- **A pin that clears the scanner but changes behaviour is not a fix.** Call the code that uses the package, not just `yarn install`. See the `moment` entry for a case found by the smoke test.

## Audit cadence

Re-audit the dependency tree monthly, before every release, and again immediately before requesting review on a change that claims a clean gate: a verification table goes stale when an advisory is published or widened, not when the tree changes.

`yarn npm audit -R` is not enough on its own. On 2026-11-20 it reported nothing for `linkify-it@2.2.0`, `marked@2.1.3`, `babel-traverse@6.26.0` and others that the registry advisory endpoint flags (`POST https://registry.npmjs.org/-/npm/v1/security/advisories/bulk` with every `name@version` of `yarn.lock`). **The CI gate follows Dependency-Track**, so measure there before concluding the app is clean, and never quote a before/after count that mixes sources.

---

## Active resolutions

All of these are security floors. None is a compatibility fixture.

### Runtime: reach the browser bundle

Verified with the approval list (sqlViews requests with `var=` and `page=` query strings) and the DataSet Configuration edit (user search and save through `@eyeseetea/d2-api`), on DHIS2 2.42.6, built app installed: same rows and same requests as before the change.

#### `axios: ^1.21.1`

- **Why:** `@eyeseetea/d2-api@1.21.0`, its latest release, requests `axios` at exactly `1.6.4`, and `@dhis2/cli-app-scripts` requests `^0.25.0`. The application's own dependency is `^1.21.1`. A global entry makes all three one copy.
- **Fixes:** 23 high and 29 medium advisories against `0.25.0` and `1.6.4` (the old direct `0.24.0` and `wait-on`'s `0.21.4` had their own, and are gone).
- **Drop when:** `@eyeseetea/d2-api` requests `axios >= 1.21.1` and `@dhis2/cli-app-scripts` drops `axios@0.x`. Check with `yarn why axios`.

#### `qs: ^6.16.1`

- **Why:** `@eyeseetea/d2-api` requests `qs` at exactly `6.9.7` and `request` requests `~6.5.2`; without the entry both resolve downwards. It also binds `url` (browser polyfills). The floor is 6.16.1 because GHSA-6pq8-jhm2-2vcw affects `>= 6.7.0, <= 6.16.0`. The range resolves to 6.17.1.
- **Fixes:** four medium and one low advisory (`<6.14.1`, `>=2.2.5 <6.16.0`, `>=6.7.0 <=6.16.0`).
- **Drop when:** every consumer requests `qs >= 6.16.1` natively. `@eyeseetea/d2-api` is the blocker.

#### `lodash: ^4.18.0`

- **Why:** several parents (`@dhis2/d2-ui-core`, `@eyeseetea/d2-api`, `@eyeseetea/d2-ui-components` and others) resolve `lodash` downwards to 4.17.20 and 4.17.21 when left alone.
- **Fixes:** GHSA-35jh-r3h4-6jhm and GHSA-r5fr-rjxr-66jc (high), plus two medium.
- **Drop when:** every parent requests `lodash >= 4.18.0`. Check with `yarn why lodash`.

#### `node-fetch: ^2.6.7`

- **Why:** `isomorphic-fetch@2.2.1` requests `node-fetch@^1.0.1`.
- **Fixes:** GHSA-r683-j2x4-v87g (high).
- **Drop when:** `isomorphic-fetch` leaves the tree or requests `node-fetch >= 2.6.7`.

#### `@eyeseetea/d2-ui-components/moment: ^2.31.0`

- **Why:** `@eyeseetea/d2-ui-components@2.6.10` requests `moment` at exactly `2.22.2`.
- ⚠️ **It changes behaviour, and the app compensates.** The table in `d2-ui-components` formats any string that `moment` parses as an ISO date, skipping only `YYYY` and `YYYY-MM`. `moment@2.22.2` read `"202609"` as the year 202609 and left it alone; every patched `moment` (checked 2.29.4, 2.30.1, 2.31.0) reads it as 2026-09-01, so the Period column showed `2026-09-01 00:00:00`. The Period column in `useDataApprovalListColumns.tsx` now returns `row.period` through `getValue`. **If you drop or change this entry, keep that `getValue`.** Found by the smoke test, not by the scanner.
- **Fixes:** GHSA-8hfj-j24r-96c4 and GHSA-wc69-rhjr-hc9g (high).
- **Drop when:** `@eyeseetea/d2-ui-components` requests `moment >= 2.29.4` natively (2.13.0 does, at exactly 2.29.4) and is upgraded.

#### `react-linkify/linkify-it: ^5.0.2`

- **Why:** `react-linkify@1.0.0-alpha`, used by the table in `d2-ui-components`, requests `linkify-it@^2.0.3`.
- **Fixes:** GHSA-22p9-wv53-3rq4 and GHSA-v245-v573-v5vm (high) for this copy. The `linkify-it@2.2.0` that came through `markdown-it@10` and `jsdoc` is gone with `@dhis2/d2-ui-forms` (see Removed).
- **Drop when:** `@eyeseetea/d2-ui-components` drops or replaces `react-linkify`.

### Build tooling: `@dhis2/cli-app-scripts` chain

None of these reaches the browser bundle. The only commands of `@dhis2/cli-app-scripts` used here are `d2-app-scripts i18n extract` and `i18n generate` (through `yarn localize`). They were run: the generated `src/locales/en` and `es` translations are identical to the ones the previous generator produced. The other code paths these entries cover (`fetchAndExtract`, `update-notifier`) are not used by this project and were **not** exercised.

#### `@dhis2/cli-app-scripts/vite: ^7.3.7`

- **Why:** `@dhis2/cli-app-scripts` requests `vite@^5.2.9` and `esbuild@0.21.5`. The floor is the application's own vite so both resolve to one copy (7.3.8).
- **Fixes:** the advisories against vite 5 and 6 (one high, GHSA-587h-7wmj-h5pm, and medium and low ones).
- **Drop when:** `@dhis2/cli-app-scripts` requests `vite >= 7.3.7` natively.

#### `@dhis2/cli-helpers-engine/tar: ^7.5.21`

- **Why:** `@dhis2/cli-helpers-engine@3.2.2`, its latest release, requests `tar@^4.4.8` (4.4.19). Every advisory is fixed only on the 7.x line.
- **Fixes:** GHSA-23hp-3jrh-7fpw (critical); GHSA-34x7-hfp2-rc4v, GHSA-83g3-92jg-28cx, GHSA-8qq5-rm4j-mr97, GHSA-8x88-c5mf-7j5w, GHSA-9ppj-qmqm-q256, GHSA-qffp-2rhf-9h96, GHSA-r292-9mhp-454m, GHSA-r6q2-hw4h-h46w (high), plus four medium.
- **Drop when:** `@dhis2/cli-helpers-engine` requests `tar >= 7.5.21` natively.

#### `execa@npm:0.7.0/cross-spawn: ^6.0.6`

- **Why:** `@dhis2/cli-helpers-engine` → `execa@0.7.0` requests `cross-spawn@^5.0.1`. GHSA-3xgq-45jj-v275 is patched at 6.0.6 and not on 5.x.
- ⚠️ **Decay risk: keyed on the resolved version.** 0.7.0 is the only 0.7.x release, but check it at every audit.
- **Fixes:** GHSA-3xgq-45jj-v275 (high).
- **Drop when:** `execa@0.7.0` leaves the tree.

#### `external-editor/tmp: ^0.2.7`

- **Why:** `external-editor@3.1.0` requests `tmp@^0.0.33`.
- **Fixes:** GHSA-ph9p-34f9-6g65 (high) and one low. The floor is 0.2.7 because the high one is fixed in 0.2.6 and the other later.
- **Drop when:** `external-editor` requests `tmp >= 0.2.7`, or leaves the tree.

#### `http-proxy-agent/@tootallnate/once: ^2.0.1`

- **Why:** `http-proxy-agent@4` (through `jsdom@16` in the jest of `@dhis2/cli-app-scripts`) requests `@tootallnate/once@1`.
- **Fixes:** one low advisory (`<2.0.1`).
- **Drop when:** `http-proxy-agent@4` leaves the tree.

#### `latest-version/package-json: ^7.0.0`

- **Why:** `latest-version@5.1.0` requests `package-json@^6.3.0`, which pulls `got@9`; the `got` advisory is fixed in 11.8.5.
- **Fixes:** one medium advisory against `got` (`<11.8.5`).
- **Drop when:** `latest-version` requests `package-json >= 7`, or `update-notifier@3` leaves the tree.

#### `request/form-data: ^2.5.6` and `request/tough-cookie: ^4.1.3`

- **Why:** `@dhis2/cli-helpers-engine` → `request@2.88.2` requests `form-data@~2.3.2` and `tough-cookie@~2.5.0`. `request` has no later release, so its children are lifted directly.
- **Fixes:** GHSA-fjxv-7rqg-78g4 (critical) and GHSA-hmw2-7cc7-3qxx (high) against `form-data`; one medium against `tough-cookie`.
- **Drop when:** `@dhis2/cli-helpers-engine` drops `request`.

#### `i18next-conv/node-gettext: ^3.0.1`

- **Why:** `@dhis2/cli-app-scripts` → `i18next-conv@9.2.1` requests `node-gettext@^2.0.0` (2.1.0). ⚠️ **The advisory looks unfixable and is not.** GHSA-g974-hxvm-x689 declares no patched version, so tooling reports "no fix", but its range is `<= 3.0.0` and 3.0.1 is published.
- **Fixes:** GHSA-g974-hxvm-x689 (high). Exercised: `yarn localize` runs `i18next-conv`.
- **Drop when:** `i18next-conv` requests `node-gettext >= 3.0.1` natively, or drops it.

#### `styled-jsx/loader-utils: ^1.4.2`

- **Why:** the application's `styled-jsx@4.0.1` requests `loader-utils` at exactly `1.2.3`. `@dhis2/ui` peers on `styled-jsx@^4`, so the parent cannot move to 5. `loader-utils` is only used by the webpack loader of `styled-jsx`, not at runtime.
- **Fixes:** GHSA-76p3-8jx3-jpfq (critical); GHSA-3rfm-jhwj-7488 and GHSA-hhq3-ff78-jv3g (high).
- **Drop when:** `styled-jsx@4` leaves the tree.

---

## Pinned direct dependencies

#### `@dhis2/cli-app-scripts: 12.11.1`

- **Why:** the same version and decision as dhis2-app-skeleton, where 12.11.3, 12.11.4 and 12.11.8 add `__MANIFEST_APP_TITLE` and `__MANIFEST_APP_DESCRIPTION` to the translation files when there is no `d2.config.js`. ⚠️ **That was verified in the skeleton, not re-tested here.** This project has no `d2.config.js` either.
- **Fixes:** nothing. It keeps unused strings out of `i18n/en.pot` and `src/locales`.
- **Drop when:** a release stops adding the `__MANIFEST_*` keys without a `d2.config.js`. Test it by raising the version, running `yarn localize` and checking `i18n/en.pot`.

---

## Removed

Direct dependencies removed on 2026-11-20 because the project does not use them. No import in `src`, `index.html`, `vite.config.ts` or any script; typecheck, lint, tests and build pass without them.

| Package | Brought |
| --- | --- |
| `wait-on` | `axios@0.21.4`, `joi`, `follow-redirects` |
| `postcss-rtl` | `postcss@6` |
| `@dhis2/d2-ui-forms` | `d2@31.1.1` → `jsdoc@3.6.7` and `babel-jest@22`: `marked`, `taffydb`, `underscore`, `markdown-it@10`, `linkify-it@2.2.0`, `babel-traverse@6` (critical), `braces@1` |
| `gulp`, `gulp-inline-source`, `gulp-replace` and `gulpfile.js` | `svgo`, `terser`, `nth-check`, `inline-source`. The `build-report` task was not used by any script or document |
| `child_process` | an npm package named like a Node built-in |
| `node-html-parser`, `typed-immutable-map`, `classnames`, `@types/classnames`, `jszip` | nothing vulnerable; unused |

`@dhis2/d2-i18n-extract` and `@dhis2/d2-i18n-generate` have had no release since January 2024; they were replaced by `@dhis2/cli-app-scripts`, as in dhis2-app-skeleton.

---

## Known findings with no fix available

Recorded here rather than in `resolutions` because **no version resolves them**. Registry advisory data for the final tree, 2026-11-20: 0 critical, 0 high, 8 medium, 1 low. Dependency-Track scores some of them higher; check there.

#### `uuid@3.4.0`: GHSA-w5hq-g745-h8pq

- **Chain:** `@dhis2/cli-app-scripts` → `@dhis2/cli-helpers-engine@3.2.2` → `request@2.88.2` → `uuid@^3.3.2`.
- **Why it cannot be fixed:** the advisory is patched at 11.1.1, but `request` imports the `uuid/v4` subpath, which was removed in uuid 7.
- **Impact:** build tooling only; the missing bounds check is in `v3()`, `v5()` and `v6()` with a caller-supplied buffer. GitHub rates it medium; Dependency-Track may rate it high. ⚠️ **If the CI gate blocks on it, it needs an approved dismissal; not yet requested.**
- **Drop when:** `request` leaves the tree.

#### `request@2.88.2`: GHSA-p8p7-x288-28g6

- **Chain:** `@dhis2/cli-app-scripts` → `@dhis2/cli-helpers-engine@3.2.2` → `request@^2.88.0`.
- **Why it cannot be fixed:** the advisory affects `<= 2.88.2`, the last release `request` ever published (deprecated).
- **Impact:** build tooling only; never reaches the browser bundle.
- **Drop when:** `@dhis2/cli-helpers-engine` drops `request`.

#### `elliptic@6.6.1`: GHSA-848j-6mx2-7j84 (low)

- **Chain:** `vite-plugin-node-polyfills` → `node-stdlib-browser` → `crypto-browserify` → `browserify-sign` and `create-ecdh`.
- **Why it cannot be fixed:** the advisory covers every version `<= 6.6.1`, and 6.6.1 is the latest.
- **Impact:** the ECDSA signing path is not used; the polyfills exist for the `Buffer` shim.
- **Drop when:** `elliptic` publishes a fix, or the polyfill chain leaves the tree.

#### `react-router@6.30.6`: GHSA-wrjc-x8rr-h8h6 and GHSA-337j-9hxr-rhxg (medium)

- **Chain:** direct dependency (`react-router-dom@^6.30.6`).
- **Why it cannot be fixed:** both affect `< 7.18.0`; 6.30.6 is the last 6.x release. Fixing them is a migration to React Router 7, outside a vulnerability round.
- **Impact:** an open redirect through a backslash in `<Link>`/`useNavigate`, and constructor injection in `deserializeErrors()`. Review whether the app passes user input to them before accepting this for good.
- **Drop when:** the app migrates to React Router 7.

#### `glob@10.5.0`, `glob@11.1.0`: GHSA-3g3m-2fjr-6pw4. `minimatch@9.0.9`, `minimatch@10.2.6`: GHSA-g3hv-75wg-m249 (medium)

- **Chain:** `glob@10` through `archiver-utils` and `glob@11` through `workbox-build`, both under `@dhis2/cli-app-scripts`; `minimatch@9` and `minimatch@10` through those `glob` releases.
- **Why it is not fixed here:** both are fixed only on a new major (`glob@14.0.2`, `minimatch@11.0.1`), and no released parent requests them. Forcing a major on parents that never tested it is the pattern that breaks consumers.
- **Impact:** build tooling only. The `minimatch` advisory needs an attacker-supplied pattern; every pattern here comes from the repository's own configuration.
- **Drop when:** each parent requests the patched major.

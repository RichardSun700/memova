## Summary

<!-- What changed, and why is this the smallest coherent change? -->

## Change type

- [ ] OAuth / authentication
- [ ] Privacy, terms, data deletion, or legal copy
- [ ] ODM partnership page
- [ ] SEO/GEO, redirects, headers, robots, or sitemap
- [ ] Main website UI or behavior
- [ ] Team profile page
- [ ] Documentation / tooling only

## Affected files and routes

<!-- List important files and every production route that needs verification. -->

## OAuth and privacy impact

- [ ] No OAuth or privacy behavior/copy changes
- [ ] OAuth scopes, consent, or authentication behavior changed
- [ ] Privacy, data use, retention, deletion, or third-party handling changed
- [ ] Required human content review has been completed

<!-- If affected, describe the exact scope/data/wording change. Do not include secrets. -->

## Validation

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm run check`
- [ ] `pnpm run build`
- [ ] `pnpm test`
- [ ] `pnpm run check:seo`
- [ ] `pnpm run check:production-source`
- [ ] Changed routes verified
- [ ] Desktop and mobile evidence attached for visible UI changes, or not applicable

## Rollback

<!-- Identify the revert commit or the smallest safe rollback action. -->

## Safety

- [ ] This PR contains no tokens, client secrets, private keys, credentials, or user data.
- [ ] This PR does not deploy automatically.

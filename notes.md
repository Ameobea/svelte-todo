- MAKE USE OF STYLED BLOCK QUOTES TO SHOW GOOD AND BAD THINGS PROMINENTLY. PUT INFO ABOUT THAT IN INTRO.
- PUT TL;DR WITH MAJOR TAKEAWAYS AT THE TOP
- **It feels much like Rust vs. C++. Rather than adding layers upon layers to existing infinitely backwards-compatible software, it takes the best patterns and features and builds them from the ground up. The result is a vastly simpler, faster, leaner, and easier to use stack that's still familiar to users of the current tooling.**

## background

I was prompted to try out svelte/sveltekit due to a Cloudflare blog post announcing that Sveltekit would be integrated with their new full-stack cloudflare pages out of the box <https://blog.cloudflare.com/cloudflare-pages-goes-full-stack/>. That's a big endorsement; Cloudflare has been putting a ton of effort into evolving the state of web app development and deployment, fleshing out their app platforms to compete with the big cloud providers and bring new paradigms to the mainstream.

Sveltekit is evolving VERY fast. It reminds me of the earlier days of using rust nightly. There are tons of libraries and repos, all of them seem to depend on each other in complicated ways. Sveltekit makes it clear that it's experimental technology and to expect issues; that warning is shown when installing sveltekit, in the docs on the sveltekit node adapter package, and other places too.

Everything seems new. Lots of strange names that I'm not familiar with:

- vite: https://vitejs.dev/
  - Seems to be the entrypoint to all commands like `npm run dev` and `npm run build`
  - Seems to be compatible with rollup: "Vite plugins are an extension of Rollup's plugin interface"
  - Uses [`vite-plugin-svelte`](https://github.com/sveltejs/vite-plugin-svelte) which has `esbuild` as a dependency
  - `vite-plugin-svelte` seems to pull in `esbuild` and patch it into the plugins somewhere as well. I don't understand exactly how/where it fits into the build process, but it shows that `esbuild` is the running command in my terminal tab when I run `npm run dev`.
- Webserver for `@sveltejs/adapter-node`
  - Uses a `polka` weberver at the top levelPolka: "A micro web server so fast, it'll make you dance" https://github.com/lukeed/polka
    - alternative to express, it seems.
    - Surprisingly, it doesn't look too new and doesn't look super well maintained (last commit 8 months ago??)
    - Based on an older webserver called Trouter which I can't even find the code for anymore. I'm quite surprised that the webserver is this old and inactive; I'd expect that the
  - Wraps a handler written using [`sirv`](https://www.npmjs.com/package/sirv) for static file serving
  - Doesn't seem to handle serving the endpoints at all...
- Webserver for endpoints
  - Handled by SvelteKit directly without falling back to adapter at all
  - Seems to be using Polka as well with what seems like the option to fall back to NodeJS built-in HTTP server as well

I went with Sqlite, prompted by lobste.rs post <https://lobste.rs/s/0q9w7n/consider_sqlite>. It was easy enough getting it set up; no batteries included for migrations or whatever, though. I'm sure I could have brought it in with an ORM or something, though.

## general thoughts

- No types provided E2E for endpoints. No way to enumerate endpoints, validate URLs for endpoints. This isn't that big of a deal because you don't necessarily get this doing things other ways.
  - Sveltekit has a [pre-built integration](https://github.com/svelte-add/graphql-server) with [`graphql-helix`](https://github.com/contrawork/graphql-helix/) which might provide some of those things. I've not worked with that tooling or with GraphQL itself, though, so idk for sure.
  - Being able to import the same types between the frontend and backend is a great benefit, though. Would otherwise have to make a shared library or something.
- I really miss my `serde` functionality when building the backend. Have to manually construct data models for my types which don't map to that of the database directly, have to manually validate and construct error messages, etc.
  - Using `io-ts` is ok and <https://transform.tools> has the same functionality as it does for `serde` for generating models for it, although I had to create my own unsigned int type which was annoying.
- No way that I could tell for handling errors other than manually returning
  - JS errors in endpoints in dev mode return the error message along with the stack trace, nice and simple and just what I'd hope for
  - JS errors in endpoints in prod mode return the error string but without the backtrace. Might need to be careful to avoid leaking anything secret in error messages.
- Includes middleware-like support via [hooks](https://kit.svelte.dev/docs#hooks)
- Setting up absolute imports (`import {Todo} from src/types`) was easy but manual. Maybe enable this by default?
- All the great benefits of svelte were available with zero effort.
  - Getting SASS working was as wasy as `yarn add node-sass` and the rest just worked with no configuration.
  - TypeScript worked out of the box with zero config necessary! It was an option during the setup.
- Importing assets like images from inside JS can be done via [`svelte-preprocess-import-assets`](https://github.com/bluwy/svelte-preprocess-import-assets). Says it takes care of producing hashed filenames too which is great.
  - Ran into issues getting this working; adding it as a preprocessor broke typescript support.
  - Turns out the library only has 9 stars and just over 100 weekly downloads on NPM
  - Found a note in the last commit 4 months ago mentioning incompatibility with `svelte-preprocess` by default and linking [an RFC](https://github.com/sveltejs/rfcs/pull/56) for the svelte repo created in July discussing a rework of the preprocessing API
  - As suggested by the author in the README, I tried out [`svelte-sequential-preprocessor`](https://github.com/pchynoweth/svelte-sequential-preprocessor) to work around the issue.
  - Using that and making sure to load `svelte-preprocess` first worked! Even had TypeScript support, properly typing the imported image as a string ready for insertion into `src` of an `<img>`.
  - `preprocess: seqPreprocessor([preprocess({ sourceMap: true }), importAssets()]),`
  - Didn't work, useful error in log: `The request url "/Users/casey/svelte-todo/assets/img.png" is outside of Vite serving allow list.`
  - [Great docs](https://vitejs.dev/config/#server-fs-allow) linked on how to enable it.
    - Server auto-reloaded, but didn't work. I manually killed and re-started it, which fixed it. Misleading that it said it was re-starting but didn't pick up that config change.
  - After that, it just worked! In dev and prod. Hash added in prod mode as well, very nice.
- Also an image optimization plugin a la `gatsby-plugin-image` but I didn't try it out: <https://github.com/rodneylab/sveltekit-image-plugin/>
  - 32 weekly downloads, 6 stars, last commit 21 days ago
- Builds are lightning quick, thanks to `vite`. Webpack builds have sped up 2-5x over the past couple of major versions for me, and this feels 10x faster than that. It's true that my app is very minimal right now, but I have `node-sass` set up and it's building both the frontend and the backend so it's great.
  - 1.36 seconds for a full build of both frontend and backend. If I wrote the backend in Rust, it would take at least 10 seconds for even an incremental build with a clean release build taking easily over a minute. Probably way less performance, though.
  - `npm run dev` is even faster, well under a second.
- HMR works perfectly with zero effort, just like using svelte by itself. Hot reloads are faster than anything I've ever seen before.
- It doesn't look like people are widely embracing this library yet
  - Node adapter doesn't seem to be the main focus; very low download counts across the board from NPM
    - node adapter download counts: https://ameo.link/u/9lt.png
  - sveltekit download counts: https://ameo.link/u/9lu.png
    - weekly downloads was <1,500 at the beginning of 2020, up to >33k now
  - cloudflare adapter is being embraced rapidly with weekly downloads increasing at a very fast rate from since its introduction in November. This is around 50% of the total downloads of sveltekit itself, suggesting that many/most of the people using sveltekit are using it with cloudflare pages. Seems that Cloudflare pages is driving the adoption of sveltekit.
  - 6.3k stars on Github though; it's popular with devs (most loved framework on SO survey <https://insights.stackoverflow.com/survey/2021#section-most-loved-dreaded-and-wanted-web-frameworks>)
- Noticed it's emitting raw `import {...}` directives in the generated JS. Generating scripts with `type="module"`. This was the first time I'd ever seen these anywhere. I was very surprised and happy to read that [JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) have been supported since Chrome 61 and are supported in all major browsers except IE.
- Emitted HTML isn't minified. Probably a step to enable that; might be desirable for bigger sites. JS is minified, however.
- Modern syntax `?.` seems to be transformed automatically. There are docs about adding support for `babel`, and I was able to do that just by installing two packages and copy-pasting some config lines. It complained about warnings in the console; seemed to be running some linting step after it did the transpilation.
  - It would be useful to know what browsers are supported with the default configuration. Why does babel support exist?
  - [`svelte-preprocess`](https://github.com/sveltejs/svelte-preprocess) docs say that babel may be needed for transpiling modern JS features, but it seems to already be doing that. Maybe things have changed and the docs are out of
- Responses are gzip'd by default, but everything is HTTP1. Probably want to deploy this behind a proxy/load balancer with a more modern HTTP stack if using the node adapter, but you'd probably do that anyway.
  - It seems that there is brotli support in there, and it even looks like it's [enabled explicitly in the source code](https://github.com/sveltejs/kit/blob/6c9b73977f7cb54902c55ccc395510b7ac3eb35b/packages/adapter-node/src/handler.js#L31) for `adapter-node`, but it doesn't seem to be working for whatever reason.
  - 70KB resources all included for my bare-bones to-do app frontend; 30KB gzip'd which I'd say is excellent even though the thing is super minimal. 30KB is going to be negligible even on very slow connections.
- Cache headers are set for static assets automatically, including disabling cache for html. Very nice!
  - All frontend files except for HTML and `manifest.json` seem to include hashes.

## issues

- Imports broken for packages in the backend. Typescript checks out fine in VS Code, but after running `yarn build` it complains that it can't import from directories.
  - Looking into the [Svelte Discord server](https://discord.com/invite/yy75DKs), this seems to be a fresh issue
- Tried to set up the deno adapter, a community-supplied adapter. I'd never used deno before, but I'd heard good things and I felt like it would go well with the theme of trying out new and modern software.

```
TypeError: Cannot read properties of undefined (reading 'log')
    at adapt (file:///Users/casey/svelte-todo/node_modules/svelte-adapter-deno/index.js:41:10)
    at adapt (file:///Users/casey/svelte-todo/node_modules/@sveltejs/kit/dist/chunks/index5.js:623:8)
    at file:///Users/casey/svelte-todo/node_modules/@sveltejs/kit/dist/cli.js:948:11
```

This seems to be an internal incompatibility thing. Looking more closely at the project, it only has 10 commits, the last commit was in October, and it's maintained by one person only. Definitly not something I want to depend on for any project I plan on keeping around for any amount of time, especially for such a fast-changing environment as sveltekit.

- Couldn't figure out how to get source maps to generate. Tried several things, can't find any docs that work.
- It seems that my frontend routes aren't pre-rendering by default. I have to enable it specifically with `export const prerender = true;` variable
  - Would be nice if that were something that could be detected automatically like `gatsby` does.
  - The static adapter enables this automatically, so maybe there is some technical limitation
- VS Code plugin works great out of the box, but editor features perform poorly when syntax isn't valid or when in the middle of typing an incomplete line
  - Plugin can be slow at times, taking up to a second to catch up even for relatively simple projects
  - I'm spoiled by `rust-analyzer` tbh and it's extremely usable as-is with zero configuration after installing it.
  - No "go to type definition" available within `.svelte` files which is annoying
  - That all being said, the majority of everything I have in the native VS Code typescript extension is there and the impact to my productivity isn't severe

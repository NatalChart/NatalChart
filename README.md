# Open source natal chart

web app available at 
https://natalchart.github.io/NatalChart/


web app based on a boilerplate:
https://github.com/vadimmarkov/webpack-es6-sass-boilerplate
moshier ephemeris implementation:
https://github.com/0xStarcat/Moshier-Ephemeris-JS

## Commands

- `start` - start the dev server
- `build` - create build in `doc` folder
- `analyze` - analyze your production bundle
- `lint-code` - run an ESLint check
- `lint-style` - run a Stylelint check
- `check-eslint-config` - check if ESLint config contains any rules that are unnecessary or conflict with Prettier
- `check-stylelint-config` - check if Stylelint config contains any rules that are unnecessary or conflict with Prettier



In order to host the app (i.e. github pages) add subtree to the rep:
npm run build
git add build && git commit -m "build subtree commit"
git subtree push --prefix build host gh-pages

Mind it that repo name should be the same as github username

If after several commits to master there are errors with the subtree, its not worth it to try to rebase or fix it (thanks, git), just manually remove the branch and create subtree again

git branch -d gh-pages
git push host --delete gh-pages

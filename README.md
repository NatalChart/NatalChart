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

in order to add subtree (i.e. github pages) to the rep:
git add build && git commit -m "build subtree commit"

and then you want to push:
git subtree push --prefix build host gh-pages
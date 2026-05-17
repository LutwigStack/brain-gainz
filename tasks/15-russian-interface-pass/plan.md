# Russian Interface Pass Plan

## Order

1. Make an inventory of visible English text and agree on terms.
2. Translate shell, Campaign Menu, Today, and daily tasks.
3. Translate map, route overview, and inspector.
4. Translate knowledge check surfaces.
5. Run browser QA and produce a leftover-English list.

## Important Principle

This is not just search-and-replace. Some English labels are symptoms of unclear state names. When a direct translation is awkward, choose a clearer Russian user-facing term.

## Do Not

- introduce a large localization framework unless the codebase clearly needs it now
- translate internal ids, slugs, asset filenames, or database fields
- add long explanatory copy to compensate for weak layout
- hide technical errors by making them vague

## QA Targets

- desktop `1280x900`
- mobile `390x844`
- Campaign Menu
- Today with active tasks
- Today ready to finish
- map route overview
- node inspector
- knowledge check flow
- Wind Rose

# Local Data Recovery Plan

## Order

1. Reproduce the old local storage failure and save the exact failure notes.
2. Add a safe repair or migration path for the broken schema/state.
3. Add a user recovery screen for cases that cannot be repaired automatically.
4. Add regression coverage for dirty local data.
5. Run browser QA on both dirty and clean profiles.

## Main Risk

Do not fix this by clearing storage silently. The app should protect the user's local work.

## QA Targets

- old in-app browser storage
- clean temporary profile
- successful automatic repair
- failed repair with recovery screen
- campaign menu after repair
- Today after repair
- map after repair
- checks after repair

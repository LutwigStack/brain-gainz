# 02 Campaign Menu Entry Clarity

## Status

`planned`

## Goal

Make the campaign menu understandable as the app entry point and make system/developer campaigns distinct from user campaigns.

## Scope

- clarify `Продолжить` as last-opened campaign continuation
- visually distinguish `developer_main` / system data from user campaigns
- reduce repeated badges and identical campaign card affordances
- make archive and restore actions explicit
- keep `developer_main` impossible to archive
- keep archived campaigns out of one-click continue

## UX Direction

- One obvious path back into the last campaign.
- One primary action per campaign card.
- System/developer data must not look like a normal user-created campaign.
- Restore must be a real action label, not only an icon.

## Done When

- app launch makes campaign selection obvious within two seconds
- `Продолжить` shows which campaign will open
- user campaign cards and developer/system card have distinct visual treatment
- archive action is understandable and not visually equal to open
- archived campaign row has an explicit `Восстановить` action or equivalent accessible label
- user can archive and restore a campaign without losing orientation

## High-Risk Scenarios

- last-opened campaign is archived
- only `developer_main` remains
- user campaign name is long
- mobile campaign menu at 390px


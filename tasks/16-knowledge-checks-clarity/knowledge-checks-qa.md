# Knowledge Checks QA

## Environment

- URL: `http://127.0.0.1:5174`
- Browser: temporary Chrome profile through Playwright
- Campaign: fresh fork of `Computer Science Bachelor`
- Console errors: none during the QA pass

The Codex in-app browser could not create a campaign because its local web database hit an existing PR1 schema verification error. I used a separate temporary Chrome profile instead, so QA did not modify that browser storage.

## Covered Checks

- Checklist: `Programming Environment`
  - Screenshot: [knowledge-checks-checklist-disabled-desktop.png](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/16-knowledge-checks-clarity/qa/knowledge-checks-checklist-disabled-desktop.png)
  - Verified: disabled action gives the nearby reason to select at least one checklist item.
- Exact answer: `Values, Variables, And Types`
  - Screenshot: [knowledge-checks-exact-input-desktop.png](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/16-knowledge-checks-clarity/qa/knowledge-checks-exact-input-desktop.png)
  - Verified: answer field says it is a precise answer and explains the comparison.
- Failed exact attempt
  - Screenshot: [knowledge-checks-exact-failed-attempt-desktop.png](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/16-knowledge-checks-clarity/qa/knowledge-checks-exact-failed-attempt-desktop.png)
  - Verified: wrong answer shows `Пока не зачтено`; progress and XP do not change.
- Passed exact attempt
  - Screenshot: [knowledge-checks-exact-passed-attempt-desktop.png](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/16-knowledge-checks-clarity/qa/knowledge-checks-exact-passed-attempt-desktop.png)
  - Verified: correct answer shows `Зачтено`; confirmed progress and XP are called out.
- Number: `Expressions And Operators`
  - Screenshot: [knowledge-checks-number-input-desktop.png](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/16-knowledge-checks-clarity/qa/knowledge-checks-number-input-desktop.png)
  - Verified: field says to enter a number and mentions tolerance.
- Contains: `Branching With Conditionals`
  - Screenshot: [knowledge-checks-contains-input-desktop.png](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/16-knowledge-checks-clarity/qa/knowledge-checks-contains-input-desktop.png)
  - Verified: field says the answer must include required terms.

## Not Covered In Browser

- Manual strict and AI-assisted were covered by shared copy helpers and unit tests, not by screenshots in this QA pass.
- Mobile viewport was not run in this pass; desktop screenshots showed no obvious overflow in the checked panels.

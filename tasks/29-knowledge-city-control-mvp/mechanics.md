# Knowledge City Control MVP Mechanics

## 1. Design Target

This MVP has one center:

> Capture and hold a knowledge city against one opponent.

The mechanic must make existing learning actions more understandable. It must not add a second game that distracts from learning.

## 2. Core Objects

### City

The selected personal campaign.

Templates do not run opponent simulation. Archived campaigns do not run opponent simulation.

### City Object

A branch/course/infrastructure object inside a campaign.

MVP mapping:

- Prefer `skill` as the city object.
- Use `direction` or `sphere` only when a campaign has too few skills.
- Use route stages as display grouping when available.

### Section

A knowledge node inside an object.

### Opponent

Exactly one opponent per personal campaign.

Minimum fields:

- `campaign_id`
- `name`
- `persona_key`
- `xp`
- `momentum`
- `pressure_level`
- `target_object_id`
- `last_turn_resolved_at`

Suggested fallback values:

- name: `Соперник`
- persona_key: `default-rival`
- xp: `0`
- momentum: `1`
- pressure_level: `calm`

For CS bachelor, name may be `Corvus AI`.

## 3. Control States

Control states are derived first. Persist only what is necessary for opponent turns.

### Node Control State

| State | Meaning | Primary input |
| --- | --- | --- |
| `unclaimed` | Not learned yet | no self mark, no mastery |
| `scouted` | User self-marked progress | self-marked mastery, no verified mastery |
| `controlled` | Verified and fresh enough | active mastery event, not stale |
| `fortified` | Verified and recently reinforced | recent pass/review |
| `weakened` | Verified but stale | mastery age past retention threshold |
| `contested` | Opponent pressure or failed attempt | weak spot, failed attempt, due recovery |
| `lost` | Control temporarily lost to opponent | contested too long or pressure threshold |

MVP can implement `lost` as a derived visual state, not as deletion of mastery.

### Object Control State

Object state is aggregated from node states:

- `secure`: most required nodes are controlled/fortified.
- `developing`: many nodes unclaimed, but no major pressure.
- `weakening`: stale controlled nodes are accumulating.
- `contested`: at least one important node is contested or failed.
- `lost_ground`: enough important nodes are lost/contested that the object needs recovery.

Suggested first formula:

```
control_score =
  fortified_nodes * 1.15 +
  controlled_nodes * 1.0 +
  scouted_nodes * 0.35 -
  weakened_nodes * 0.35 -
  contested_nodes * 0.75 -
  lost_nodes * 1.0
```

Normalize to `0..100` by required node count.

Do not expose formula to user. Expose plain copy:

- `Объект под контролем`
- `Контроль ослабевает`
- `Соперник давит`
- `Нужно восстановить`

## 4. Retention Thresholds

MVP thresholds should be conservative.

Suggested defaults:

- Fresh verified node: `0-6 days`
- Fortified after review/pass: `0-3 days`
- Weakening starts: `7+ days`
- Contested candidate: `14+ days` plus weak/failed signals
- Lost visual state: `21+ days` plus unresolved pressure

These thresholds should be tunable constants, not scattered literals.

## 5. Opponent XP

Opponent XP is not damage to the player. It is visible influence gained by the opponent.

It should explain why the opponent is advancing:

- `+5 базовое давление`
- `+4 за слабые участки`
- `+8 за проваленную защиту`
- `+3 за оспариваемый объект`

### Daily Turn

Run at most once per local calendar day per personal active campaign.

Resolve missed days with a cap:

- maximum `7` days per app open
- no simulation for archived campaigns
- no simulation for templates
- no simulation before campaign has meaningful learning content

Suggested daily XP:

```
base_pressure = 3
weak_node_pressure = min(12, weak_due_node_count * 2)
contested_pressure = min(10, contested_node_count * 3)
target_object_bonus = target_object_is_unresolved ? 4 : 0
daily_opponent_xp = base_pressure + weak_node_pressure + contested_pressure + target_object_bonus
```

Cap:

```
daily_opponent_xp <= 25
missed_day_total <= 120
```

Rationale: enough to create pressure, not enough to punish absence with hopeless loss.

### Immediate XP Events

Opponent gains XP from player outcomes:

- failed assessment on controlled/weakened node: `+8`
- defer contested recovery: `+4`
- skip contested recovery: `+5`
- abandon daily run with contested tasks unresolved: `+6` max once per day

Opponent does not gain XP from:

- user browsing the map;
- opening another tab;
- not having a campaign selected;
- templates.

### Player Pushback

Player can reduce pressure, but opponent XP remains cumulative history.

Use separate `momentum`/object pressure for current state.

Player actions:

- pass assessment on contested node: reduce object pressure `-12`
- pass review on weakened node: reduce object pressure `-8`
- complete next route node: reduce target object pressure `-5`
- finish daily run with at least one defense: reduce opponent momentum `-1`, min `1`

Do not subtract historical opponent XP unless the UI uses "current influence" rather than "total XP".

## 6. Opponent Target Selection

Opponent should target one object at a time.

Target score:

```
target_score =
  contested_nodes * 4 +
  weakened_nodes * 2 +
  failed_recent_nodes * 3 +
  route_front_bonus * 2 -
  fortified_nodes * 1
```

Tie-breakers:

1. Current route stage/object.
2. Highest required node count.
3. Lowest control score.

User-facing copy:

> Соперник давит на Архив структур: 2 слабых участка и 1 проваленная проверка.

## 7. Pressure Levels

Campaign pressure:

- `calm`: opponent is present, no urgent threat.
- `watch`: weak zones exist.
- `attack`: one object is contested.
- `breach`: object is losing ground.

Suggested thresholds:

```
calm: target_object_pressure < 10
watch: 10..24
attack: 25..44
breach: 45+
```

Pressure levels drive copy and visuals, not hard locks.

## 8. UX Rules

The opponent must never make the user feel that the app randomly punished them.

Every pressure state needs a reason:

- `давно не повторялось`;
- `провалена проверка`;
- `есть слабое место`;
- `объект на текущем маршруте`;
- `дневная операция не закрыта`.

Every bad state needs a next action:

- `Повторить`
- `Пройти проверку`
- `Вернуть контроль`
- `Открыть на карте`
- `Начать короткую защиту`

## 9. Screen Responsibilities

### Campaign Menu

Shows city/campaign identity only.

Do not overload with opponent details in MVP.

Possible small signal:

- `Соперник: спокойно / давление / атака`

### Today

Main command center.

Must show:

- current city object;
- opponent target;
- pressure reason;
- next action to gain or hold control;
- player vs opponent XP/influence summary.

### Map

Main control surface.

Must show node states:

- unclaimed
- scouted
- controlled
- weakened
- contested
- lost

### Inspector

Explains one selected node:

- current control state;
- why it is in that state;
- what action changes it;
- assessment/review status.

### Assessment

Shows the result as control outcome:

- pass: `Контроль закреплен`
- fail: `Контроль не удержан`
- retry: `Повторить защиту`

### Wind Rose

Strategic overview:

- object control score;
- opponent target object;
- strongest and weakest objects;
- best next move.

## 10. MVP Data Strategy

Prefer derived state where possible.

Persist only:

- opponent campaign row;
- opponent cumulative XP;
- current momentum/pressure;
- last resolved turn date;
- object pressure snapshots if derivation becomes too expensive.

Avoid:

- per-node ownership table in the first slice unless needed;
- random simulation;
- irreversible state transitions.

## 11. Calibration Rules

- One successful daily session should visibly improve the situation.
- One missed day should not create panic.
- A week of ignored weak spots may create clear pressure.
- Failed checks should matter, but should immediately offer recovery.
- Opponent XP should be slower than normal player progress when the player is active.
- Recovery should be faster than losing ground.

## 12. First Vertical Slice

Use `Бакалавриат по информатике`.

Implement:

1. One opponent row for personal campaign.
2. Derived object/node control states.
3. Daily opponent XP turn.
4. Today opponent pressure panel.
5. Map node color overlay.
6. Assessment pass/fail control copy.
7. Wind Rose object control summary.

Do not implement:

- bosses;
- multi-opponent;
- buildings;
- economy;
- animations.

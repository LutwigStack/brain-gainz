import test from 'node:test';
import assert from 'node:assert/strict';

import { bootstrapDatabase } from '../src/database/bootstrap.js';
import { createNowService } from '../src/application/now-service.js';
import { createCampaignStore } from '../src/stores/campaign-store.js';
import { createDailySessionStore } from '../src/stores/daily-session-store.js';
import { createHierarchyStore } from '../src/stores/hierarchy-store.js';
import { createNodeNoteStore } from '../src/stores/node-note-store.js';
import { createReviewStateStore } from '../src/stores/review-state-store.js';
import { createSqliteTestDatabase } from './support/sqlite-test-adapter.js';

const setupCampaignService = async () => {
  const database = createSqliteTestDatabase();
  await bootstrapDatabase(database);
  const hierarchyStore = createHierarchyStore(database);
  const nodeNoteStore = createNodeNoteStore(database);
  const reviewStateStore = createReviewStateStore(database);
  const dailySessionStore = createDailySessionStore(database);
  const nowService = createNowService({
    database,
    hierarchyStore,
    nodeNoteStore,
    reviewStateStore,
    dailySessionStore,
  });
  const campaignStore = createCampaignStore(database, hierarchyStore);

  return {
    database,
    hierarchyStore,
    nowService,
    campaignStore,
  };
};

test('campaign migration is idempotent and seeds one developer main campaign', async (t) => {
  const { database } = await setupCampaignService();
  t.after(() => database.close());

  await bootstrapDatabase(database);

  const rows = await database.select("SELECT * FROM campaigns WHERE type = 'developer_main'");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].is_archived, 0);

  const stats = await database.select('SELECT * FROM campaign_stats WHERE campaign_id = ?', [rows[0].id]);
  assert.equal(stats.length > 0, true);
});

test('user campaigns can be created, archived, and restored while developer main is protected', async (t) => {
  const { database, campaignStore } = await setupCampaignService();
  t.after(() => database.close());

  const created = await campaignStore.createUserCampaign({ name: 'English Foundations' });
  assert.equal(created.type, 'user');

  const developer = (await database.select("SELECT * FROM campaigns WHERE type = 'developer_main' LIMIT 1"))[0];
  await assert.rejects(() => campaignStore.archiveCampaign(developer.id), /developer_main/);

  await campaignStore.archiveCampaign(created.id);
  let campaigns = await campaignStore.listCampaigns();
  assert.equal(campaigns.active.some((campaign) => campaign.id === created.id), false);
  assert.equal(campaigns.archived.some((campaign) => campaign.id === created.id), true);

  await campaignStore.restoreCampaign(created.id);
  campaigns = await campaignStore.listCampaigns();
  assert.equal(campaigns.active.some((campaign) => campaign.id === created.id), true);
});

test('navigation snapshots are scoped to the selected campaign', async (t) => {
  const { database, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const first = await campaignStore.createUserCampaign({ name: 'Campaign A' });
  const second = await campaignStore.createUserCampaign({ name: 'Campaign B' });

  const firstNavigation = await nowService.getNavigationSnapshot(first.id);
  const secondNavigation = await nowService.getNavigationSnapshot(second.id);

  assert.equal(firstNavigation.spheres.length, 1);
  assert.equal(secondNavigation.spheres.length, 1);
  assert.notEqual(firstNavigation.spheres[0].id, secondNavigation.spheres[0].id);
  assert.equal(firstNavigation.spheres[0].name, 'Campaign A');
  assert.equal(secondNavigation.spheres[0].name, 'Campaign B');
});

test('starter and linear algebra workspaces can be created in multiple campaigns', async (t) => {
  const { database, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const developer = (await database.select("SELECT * FROM campaigns WHERE type = 'developer_main' LIMIT 1"))[0];
  const user = await campaignStore.createUserCampaign({ name: 'User Campaign' });

  await nowService.createStarterWorkspace(developer.id);
  await nowService.createStarterWorkspace(user.id);
  await nowService.createLinearAlgebraGraphWorkspace(developer.id);
  await nowService.createLinearAlgebraGraphWorkspace(user.id);

  const duplicateSlugRows = await database.select(
    `
      SELECT slug, COUNT(*) AS count
      FROM spheres
      WHERE slug IN ('career', 'linear-algebra-course')
      GROUP BY slug
      ORDER BY slug ASC
    `,
  );

  assert.deepEqual(
    duplicateSlugRows.map((row) => [row.slug, Number(row.count)]),
    [
      ['career', 2],
      ['linear-algebra-course', 2],
    ],
  );
});

test('startTodaySessionFromPrimaryRecommendation uses the explicit campaign id', async (t) => {
  const { database, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const developer = (await database.select("SELECT * FROM campaigns WHERE type = 'developer_main' LIMIT 1"))[0];
  const user = await campaignStore.createUserCampaign({ name: 'Recent User Campaign' });
  await nowService.createStarterWorkspace(developer.id);
  await nowService.createStarterWorkspace(user.id);

  await nowService.startTodaySessionFromPrimaryRecommendation(developer.id);

  const sessions = await database.select('SELECT * FROM daily_sessions WHERE status = ? ORDER BY id ASC', ['active']);
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].campaign_id, developer.id);
});

test('wind rose branches expose map target labels for branch navigation', async (t) => {
  const { database, hierarchyStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const developer = (await database.select("SELECT * FROM campaigns WHERE type = 'developer_main' LIMIT 1"))[0];
  await nowService.createStarterWorkspace(developer.id);

  const [nextAction] = await database.select(
    `
      SELECT actions.*, nodes.skill_id, nodes.id AS action_node_id, nodes.title AS action_node_title
      FROM node_actions actions
      JOIN nodes ON nodes.id = actions.node_id
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
        AND actions.status IN ('todo', 'ready', 'doing')
      ORDER BY actions.sort_order ASC, actions.id ASC
      LIMIT 1
    `,
    [developer.id],
  );
  const decoyNode = await hierarchyStore.createNode({
    skill_id: nextAction.skill_id,
    type: 'task',
    status: 'active',
    title: 'Fresh branch node without next action',
    slug: 'fresh-branch-node-without-next-action',
  });

  const windRose = await nowService.getWindRoseSnapshot(developer.id);
  const branch = windRose.stats.flatMap((stat) => stat.branches).find((item) => item.next_action_id != null);

  assert.ok(branch);
  assert.equal(branch.id, nextAction.skill_id);
  assert.equal(branch.focus_node_id, nextAction.action_node_id);
  assert.notEqual(branch.focus_node_id, decoyNode.id);
  assert.equal(branch.next_action_id, nextAction.id);
  assert.equal(typeof branch.focus_node_title, 'string');
  assert.equal(typeof branch.next_action_title, 'string');
  assert.equal(branch.focus_node_title, nextAction.action_node_title);
  assert.equal(branch.next_action_title.length > 0, true);
});

test('node completion grants XP once and done-to-active deactivates the grant', async (t) => {
  const { database, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const developer = (await database.select("SELECT * FROM campaigns WHERE type = 'developer_main' LIMIT 1"))[0];
  const dashboard = await nowService.createStarterWorkspace(developer.id);
  const actionId = dashboard.primaryRecommendation.actionId;
  const nodeId = dashboard.primaryRecommendation.nodeId;

  await nowService.completeActionInTodaySession(developer.id, actionId);
  await nowService.completeActionInTodaySession(developer.id, actionId);

  let grants = await database.select('SELECT * FROM stat_xp_grants WHERE campaign_id = ? AND node_id = ?', [
    developer.id,
    nodeId,
  ]);
  assert.equal(grants.length, 1);
  assert.equal(grants[0].active, 1);

  await nowService.updateNodeEditor(developer.id, nodeId, { status: 'active' });
  grants = await database.select('SELECT * FROM stat_xp_grants WHERE campaign_id = ? AND node_id = ?', [
    developer.id,
    nodeId,
  ]);
  assert.equal(grants.length, 1);
  assert.equal(grants[0].active, 0);
});

test('unarchiving a completed node preserves the existing XP grant without duplication', async (t) => {
  const { database, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const developer = (await database.select("SELECT * FROM campaigns WHERE type = 'developer_main' LIMIT 1"))[0];
  const dashboard = await nowService.createStarterWorkspace(developer.id);
  const actionId = dashboard.primaryRecommendation.actionId;
  const nodeId = dashboard.primaryRecommendation.nodeId;

  await nowService.completeActionInTodaySession(developer.id, actionId);
  await nowService.archiveNodeEditor(developer.id, nodeId);
  await nowService.updateNodeEditor(developer.id, nodeId, { is_archived: 0 });

  const grants = await database.select('SELECT * FROM stat_xp_grants WHERE campaign_id = ? AND node_id = ?', [
    developer.id,
    nodeId,
  ]);
  assert.equal(grants.length, 1);
  assert.equal(grants[0].active, 1);
});

test('graph edge mutations reject edge ids from another campaign', async (t) => {
  const { database, hierarchyStore, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const first = await campaignStore.createUserCampaign({ name: 'Campaign A' });
  const second = await campaignStore.createUserCampaign({ name: 'Campaign B' });
  const [secondSkill] = await database.select(
    `
      SELECT skills.id
      FROM skills
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
      LIMIT 1
    `,
    [second.id],
  );
  const [secondRoot] = await database.select(
    `
      SELECT nodes.*
      FROM nodes
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
      LIMIT 1
    `,
    [second.id],
  );
  const secondChild = await hierarchyStore.createNode({
    skill_id: secondSkill.id,
    type: 'task',
    status: 'active',
    title: 'Foreign child',
    slug: 'foreign-child',
  });
  const foreignEdge = await hierarchyStore.addNodeDependency({
    blocked_node_id: secondRoot.id,
    blocking_node_id: secondChild.id,
    dependency_type: 'supports',
  });

  await assert.rejects(
    () => nowService.deleteGraphEdge(first.id, foreignEdge.id),
    /кампани|campaign/i,
  );
  assert.equal(await hierarchyStore.getNodeDependencyById(foreignEdge.id) != null, true);

  await assert.rejects(
    () => nowService.updateGraphEdge(first.id, foreignEdge.id, { dependency_type: 'requires' }),
    /кампани|campaign/i,
  );
  const edgeAfterUpdateAttempt = await hierarchyStore.getNodeDependencyById(foreignEdge.id);
  assert.equal(edgeAfterUpdateAttempt.dependency_type, 'supports');
});

test('node create and duplicate reject foreign target skills before writing rows', async (t) => {
  const { database, campaignStore, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const first = await campaignStore.createUserCampaign({ name: 'Campaign A' });
  const second = await campaignStore.createUserCampaign({ name: 'Campaign B' });
  const [firstRoot] = await database.select(
    `
      SELECT nodes.*
      FROM nodes
      JOIN skills ON skills.id = nodes.skill_id
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
      LIMIT 1
    `,
    [first.id],
  );
  const [secondSkill] = await database.select(
    `
      SELECT skills.id
      FROM skills
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
      LIMIT 1
    `,
    [second.id],
  );
  const countSecondSkillNodes = async () =>
    Number((await database.select('SELECT COUNT(*) AS count FROM nodes WHERE skill_id = ?', [secondSkill.id]))[0].count);

  const beforeCreate = await countSecondSkillNodes();
  await assert.rejects(
    () =>
      nowService.createNodeEditor(first.id, {
        skill_id: secondSkill.id,
        type: 'task',
        status: 'active',
        title: 'Wrong campaign node',
        slug: 'wrong-campaign-node',
      }),
    /кампани|campaign|Навык/i,
  );
  assert.equal(await countSecondSkillNodes(), beforeCreate);

  await assert.rejects(
    () =>
      nowService.duplicateNodeEditor(first.id, firstRoot.id, {
        skill_id: secondSkill.id,
        slug: 'wrong-campaign-duplicate',
      }),
    /кампани|campaign|Навык/i,
  );
  assert.equal(await countSecondSkillNodes(), beforeCreate);
});

test('campaign summary XP is not multiplied by joined nodes or skills', async (t) => {
  const { database, hierarchyStore, campaignStore } = await setupCampaignService();
  t.after(() => database.close());

  const campaign = await campaignStore.createUserCampaign({ name: 'Campaign XP' });
  const [skill] = await database.select(
    `
      SELECT skills.id, skills.primary_stat_id
      FROM skills
      JOIN directions ON directions.id = skills.direction_id
      JOIN spheres ON spheres.id = directions.sphere_id
      WHERE spheres.campaign_id = ?
      LIMIT 1
    `,
    [campaign.id],
  );
  const [root] = await database.select('SELECT * FROM nodes WHERE skill_id = ? LIMIT 1', [skill.id]);
  await hierarchyStore.createNode({
    skill_id: skill.id,
    type: 'task',
    status: 'active',
    title: 'Extra node',
    slug: 'extra-node',
  });
  await database.execute(
    `
      INSERT INTO stat_xp_grants (
        campaign_id,
        node_id,
        branch_id,
        stat_id,
        grant_reason,
        xp_amount,
        active,
        created_at
      )
      VALUES (?, ?, ?, ?, 'node_completion', 10, 1, '2026-01-01T00:00:00.000Z')
    `,
    [campaign.id, root.id, skill.id, skill.primary_stat_id],
  );

  const campaigns = await campaignStore.listCampaigns();
  const summary = campaigns.active.find((item) => item.id === campaign.id);
  assert.equal(summary.total_xp, 10);
});

test('completed node without primary stat does not create XP grant', async (t) => {
  const { database, nowService } = await setupCampaignService();
  t.after(() => database.close());

  const developer = (await database.select("SELECT * FROM campaigns WHERE type = 'developer_main' LIMIT 1"))[0];
  const dashboard = await nowService.createStarterWorkspace(developer.id);
  const actionId = dashboard.primaryRecommendation.actionId;
  const nodeId = dashboard.primaryRecommendation.nodeId;
  const [node] = await database.select('SELECT * FROM nodes WHERE id = ?', [nodeId]);

  await database.execute('UPDATE skills SET primary_stat_id = NULL WHERE id = ?', [node.skill_id]);
  const result = await nowService.completeActionInTodaySession(developer.id, actionId);

  const grants = await database.select('SELECT * FROM stat_xp_grants WHERE campaign_id = ? AND node_id = ?', [
    developer.id,
    nodeId,
  ]);
  assert.equal(grants.length, 0);
  assert.equal(result.xpWarning?.code, 'missing-primary-stat');
});

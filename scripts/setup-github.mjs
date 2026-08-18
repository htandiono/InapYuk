#!/usr/bin/env node
/**
 * Provisions the GitHub side of the project from scripts/backlog.json:
 * labels, milestones, issues, and a GitHub Projects board with the sprint,
 * feature, area and estimate fields populated.
 *
 * Safe to re-run - every step checks for an existing record first.
 *
 * Usage:  node scripts/setup-github.mjs [--dry-run]
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const backlog = JSON.parse(readFileSync(path.join(HERE, 'backlog.json'), 'utf8'));
const DRY_RUN = process.argv.includes('--dry-run');

const GH_CANDIDATES = [
  'gh',
  path.join(process.env.ProgramFiles ?? '', 'GitHub CLI', 'gh.exe'),
  path.join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Links', 'gh.exe'),
];

const GH = GH_CANDIDATES.find((candidate) => candidate === 'gh' || existsSync(candidate)) ?? 'gh';

function gh(args, { allowFailure = false } = {}) {
  if (DRY_RUN && !isReadOnly(args)) {
    console.log(`  [dry-run] gh ${args.join(' ')}`);
    return '';
  }
  try {
    return execFileSync(GH, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (error) {
    const message = (error.stderr || error.stdout || error.message).toString().trim();
    if (allowFailure) return { error: message };
    throw new Error(`gh ${args.join(' ')}\n${message}`);
  }
}

function isReadOnly(args) {
  return args.includes('list') || args.includes('view') || args[0] === 'auth';
}

function ghJson(args, options) {
  const output = gh(args, options);
  if (typeof output !== 'string' || !output) return null;
  try {
    return JSON.parse(output);
  } catch {
    return null;
  }
}

function heading(text) {
  console.log(`\n=== ${text} ===`);
}

// ---------------------------------------------------------------------------

function checkAuth() {
  heading('Checking authentication');
  const user = ghJson(['api', 'user', '--jq', '{login: .login}']);
  const login = user?.login;
  const expected = backlog.repo.split('/')[0];

  if (!login) throw new Error('gh is not authenticated. Run: gh auth login');
  console.log(`  Authenticated as ${login}`);
  if (login !== expected) {
    throw new Error(
      `Expected to be logged in as ${expected} but found ${login}.\n` +
        `Run: gh auth switch --user ${expected}`,
    );
  }
  return login;
}

function ensureRepo() {
  heading(`Repository ${backlog.repo}`);
  const existing = ghJson(['repo', 'view', backlog.repo, '--json', 'name,url'], {
    allowFailure: true,
  });
  if (existing?.url) {
    console.log(`  Already exists: ${existing.url}`);
    return existing.url;
  }
  console.log('  Repository not found. Create it first, then re-run this script.');
  throw new Error(`Missing repository ${backlog.repo}`);
}

function ensureCollaborators() {
  heading('Collaborators');
  for (const login of backlog.collaborators) {
    const result = gh(
      [
        'api',
        '--method',
        'PUT',
        `repos/${backlog.repo}/collaborators/${login}`,
        '-f',
        'permission=push',
      ],
      { allowFailure: true },
    );
    if (result?.error) console.log(`  ${login}: ${result.error.split('\n')[0]}`);
    else console.log(`  ${login}: invited with write access`);
  }
}

function ensureLabels() {
  heading('Labels');
  const existing =
    ghJson(['label', 'list', '--repo', backlog.repo, '--limit', '100', '--json', 'name']) ?? [];
  const names = new Set(existing.map((label) => label.name));

  for (const label of backlog.labels) {
    if (names.has(label.name)) {
      console.log(`  ${label.name}: exists`);
      continue;
    }
    gh([
      'label',
      'create',
      label.name,
      '--repo',
      backlog.repo,
      '--color',
      label.color,
      '--description',
      label.description,
    ]);
    console.log(`  ${label.name}: created`);
  }
}

function ensureMilestones() {
  heading('Milestones');
  const existing = ghJson(['api', `repos/${backlog.repo}/milestones?state=all&per_page=100`]) ?? [];
  const byTitle = new Map(existing.map((m) => [m.title, m.number]));

  for (const milestone of backlog.milestones) {
    if (byTitle.has(milestone.title)) {
      console.log(`  ${milestone.title}: exists`);
      continue;
    }
    const created = ghJson([
      'api',
      '--method',
      'POST',
      `repos/${backlog.repo}/milestones`,
      '-f',
      `title=${milestone.title}`,
      '-f',
      `description=${milestone.description}`,
      '-f',
      `due_on=${milestone.dueOn}T16:00:00Z`,
    ]);
    if (created?.number) byTitle.set(milestone.title, created.number);
    console.log(`  ${milestone.title}: created`);
  }
  return byTitle;
}

// ---------------------------------------------------------------------------

function ensureProject(owner) {
  heading(`Project "${backlog.projectTitle}"`);
  const list = ghJson(['project', 'list', '--owner', owner, '--format', 'json', '--limit', '100']);
  const found = list?.projects?.find((p) => p.title === backlog.projectTitle);

  if (found) {
    console.log(`  Already exists: #${found.number} ${found.url}`);
    return { number: String(found.number), id: found.id, url: found.url };
  }

  const created = ghJson([
    'project',
    'create',
    '--owner',
    owner,
    '--title',
    backlog.projectTitle,
    '--format',
    'json',
  ]);
  if (!created)
    throw new Error('Could not create the project. Does the token have the "project" scope?');
  console.log(`  Created: #${created.number} ${created.url}`);
  return { number: String(created.number), id: created.id, url: created.url };
}

function ensureFields(owner, project) {
  heading('Project fields');
  const listFields = () =>
    ghJson([
      'project',
      'field-list',
      project.number,
      '--owner',
      owner,
      '--format',
      'json',
      '--limit',
      '50',
    ])?.fields ?? [];

  let fields = listFields();
  const names = new Set(fields.map((field) => field.name));

  for (const field of backlog.fields) {
    if (names.has(field.name)) {
      console.log(`  ${field.name}: exists`);
      continue;
    }
    const args = [
      'project',
      'field-create',
      project.number,
      '--owner',
      owner,
      '--name',
      field.name,
      '--data-type',
      field.dataType,
    ];
    if (field.options) args.push('--single-select-options', field.options.join(','));
    gh(args);
    console.log(`  ${field.name}: created`);
  }

  fields = listFields();
  return new Map(fields.map((field) => [field.name, field]));
}

/** The built-in Status field ships with three options; the board needs five. */
function extendStatusField(project, fields) {
  const status = fields.get('Status');
  if (!status) return;
  const current = (status.options ?? []).map((option) => option.name);
  const missing = backlog.statusOptions.filter((name) => !current.includes(name));
  if (missing.length === 0) {
    console.log('  Status: already has every option');
    return;
  }

  const options = backlog.statusOptions.map(
    (name) => `{name: ${JSON.stringify(name)}, color: GRAY, description: ""}`,
  );
  const mutation = `mutation {
    updateProjectV2Field(input: {
      fieldId: ${JSON.stringify(status.id)},
      singleSelectOptions: [${options.join(', ')}]
    }) { projectV2Field { ... on ProjectV2SingleSelectField { id } } }
  }`;

  const result = gh(['api', 'graphql', '-f', `query=${mutation}`], { allowFailure: true });
  if (result?.error) {
    console.log(`  Status: could not add ${missing.join(', ')} - add them in the UI`);
    return;
  }
  console.log(`  Status: added ${missing.join(', ')}`);
}

// ---------------------------------------------------------------------------

function buildIssueBody(issue) {
  const criteria = issue.acceptance.map((line) => `- [ ] ${line}`).join('\n');
  return [
    `## Goal\n\n${issue.goal}`,
    `## Acceptance criteria\n\n${criteria}`,
    `## Details\n\n- Sprint: ${issue.sprint}\n- Feature: ${issue.feature}\n- Area: ${issue.area}\n- Estimate: ${issue.estimate} points`,
  ].join('\n\n');
}

function createIssue(issue, milestones) {
  const args = [
    'issue',
    'create',
    '--repo',
    backlog.repo,
    '--title',
    issue.title,
    '--body',
    buildIssueBody(issue),
    '--milestone',
    issue.sprint,
  ];
  for (const label of [...issue.labels, `priority:${issue.priority}`]) {
    args.push('--label', label);
  }

  const withAssignee = [...args, '--assignee', issue.assignee];
  const result = gh(withAssignee, { allowFailure: true });
  if (typeof result === 'string' && result) return result.split('\n').pop();

  // A collaborator who has not accepted their invitation yet is not assignable.
  console.log(`    (could not assign ${issue.assignee}; creating unassigned)`);
  const retry = gh(args);
  return typeof retry === 'string' ? retry.split('\n').pop() : null;
}

function ensureIssues(milestones) {
  heading(`Issues (${backlog.issues.length} in the backlog)`);
  const existing =
    ghJson([
      'issue',
      'list',
      '--repo',
      backlog.repo,
      '--state',
      'all',
      '--limit',
      '300',
      '--json',
      'title,url',
    ]) ?? [];
  const byTitle = new Map(existing.map((issue) => [issue.title, issue.url]));

  const urls = [];
  for (const issue of backlog.issues) {
    const known = byTitle.get(issue.title);
    if (known) {
      urls.push({ issue, url: known });
      continue;
    }
    console.log(`  + ${issue.title}`);
    const url = createIssue(issue, milestones);
    if (url) urls.push({ issue, url });
  }
  console.log(`  ${urls.length} issues ready`);
  return urls;
}

// ---------------------------------------------------------------------------

function optionId(field, name) {
  return (field?.options ?? []).find((option) => option.name === name)?.id;
}

function setField(project, itemId, field, value, isNumber = false) {
  if (!field || !itemId) return;
  const args = [
    'project',
    'item-edit',
    '--id',
    itemId,
    '--project-id',
    project.id,
    '--field-id',
    field.id,
  ];
  if (isNumber) args.push('--number', String(value));
  else {
    const id = optionId(field, value);
    if (!id) return;
    args.push('--single-select-option-id', id);
  }
  gh(args, { allowFailure: true });
}

function addToBoard(owner, project, fields, entries) {
  heading('Adding issues to the board');
  const items =
    ghJson([
      'project',
      'item-list',
      project.number,
      '--owner',
      owner,
      '--format',
      'json',
      '--limit',
      '300',
    ])?.items ?? [];
  const byUrl = new Map(items.map((item) => [item.content?.url, item.id]));

  let added = 0;
  for (const { issue, url } of entries) {
    let itemId = byUrl.get(url);
    if (!itemId) {
      const result = ghJson([
        'project',
        'item-add',
        project.number,
        '--owner',
        owner,
        '--url',
        url,
        '--format',
        'json',
      ]);
      itemId = result?.id;
      added += 1;
    }
    setField(project, itemId, fields.get('Sprint'), issue.sprint);
    setField(project, itemId, fields.get('Feature'), issue.feature);
    setField(project, itemId, fields.get('Area'), issue.area);
    setField(project, itemId, fields.get('Estimate'), issue.estimate, true);
  }
  console.log(`  ${added} newly added, ${entries.length} total with fields set`);
}

// ---------------------------------------------------------------------------

function main() {
  if (DRY_RUN) console.log('Running in dry-run mode; no changes will be made.\n');

  const owner = checkAuth();
  ensureRepo();
  ensureCollaborators();
  ensureLabels();
  const milestones = ensureMilestones();

  const project = ensureProject(backlog.projectOwner);
  const fields = ensureFields(backlog.projectOwner, project);
  extendStatusField(project, fields);

  const entries = ensureIssues(milestones);
  addToBoard(backlog.projectOwner, project, fields, entries);

  console.log(`\nDone. Board: ${project.url}`);
  console.log(`Issues: https://github.com/${backlog.repo}/issues`);
}

try {
  main();
} catch (error) {
  console.error(`\n${error.message}`);
  process.exit(1);
}

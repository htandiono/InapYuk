#!/usr/bin/env node
/**
 * Provisions the GitHub Project board from scripts/backlog.json.
 * Tasks are draft items on the Project (not repo Issues), grouped by Sprint.
 *
 * Safe to re-run - every step checks for an existing record first.
 *
 * Usage:
 *   node scripts/setup-github.mjs
 *   node scripts/setup-github.mjs --migrate-from-issues
 *   node scripts/setup-github.mjs --dry-run
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

function buildItemBody(issue) {
  const criteria = issue.acceptance.map((line) => `- [ ] ${line}`).join('\n');
  return [
    `## Goal\n\n${issue.goal}`,
    `## Acceptance criteria\n\n${criteria}`,
    `## Details\n\n- Owner: ${issue.assignee}\n- Sprint: ${issue.sprint}\n- Feature: ${issue.feature}\n- Area: ${issue.area}\n- Estimate: ${issue.estimate} points`,
  ].join('\n\n');
}

function listProjectItems(owner, project) {
  return (
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
    ])?.items ?? []
  );
}

function capitalise(value) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
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

function applyFields(project, itemId, fields, issue) {
  setField(project, itemId, fields.get('Sprint'), issue.sprint);
  setField(project, itemId, fields.get('Feature'), issue.feature);
  setField(project, itemId, fields.get('Area'), issue.area);
  setField(project, itemId, fields.get('Owner'), issue.assignee);
  setField(project, itemId, fields.get('Priority'), capitalise(issue.priority));
  setField(project, itemId, fields.get('Estimate'), issue.estimate, true);
  setField(project, itemId, fields.get('Status'), 'Todo');
}

function ensureDraftItems(owner, project, fields) {
  heading(`Project tasks (${backlog.issues.length} in the backlog)`);
  const items = listProjectItems(owner, project);
  const byTitle = new Map(items.map((item) => [item.title, item]));

  let created = 0;
  for (const issue of backlog.issues) {
    const existing = byTitle.get(issue.title);
    if (existing?.content?.type === 'Issue') {
      // Still a repo issue linked to the board. Replace it with a draft.
      console.log(`  ~ ${issue.title} (converting from issue)`);
      gh(['project', 'item-delete', project.number, '--owner', owner, '--id', existing.id], {
        allowFailure: true,
      });
    } else if (existing) {
      applyFields(project, existing.id, fields, issue);
      continue;
    } else {
      console.log(`  + ${issue.title}`);
    }

    const createdItem = ghJson([
      'project',
      'item-create',
      project.number,
      '--owner',
      owner,
      '--title',
      issue.title,
      '--body',
      buildItemBody(issue),
      '--format',
      'json',
    ]);
    if (!createdItem?.id) continue;
    applyFields(project, createdItem.id, fields, issue);
    created += 1;
  }
  console.log(`  ${created} draft tasks created`);
}

function closeBacklogIssues() {
  heading('Closing repo issues that belong on the board');
  const titles = new Set(backlog.issues.map((issue) => issue.title));
  const open =
    ghJson([
      'issue',
      'list',
      '--repo',
      backlog.repo,
      '--state',
      'open',
      '--limit',
      '200',
      '--json',
      'number,title',
    ]) ?? [];

  let closed = 0;
  for (const issue of open) {
    if (!titles.has(issue.title)) continue;
    gh(
      [
        'issue',
        'close',
        String(issue.number),
        '--repo',
        backlog.repo,
        '--reason',
        'not planned',
        '--comment',
        'Moved to the InapYuk Final Project board as a draft item (not tracked as a GitHub Issue).',
      ],
      { allowFailure: true },
    );
    closed += 1;
  }
  console.log(`  ${closed} issues closed`);
}

function removeIssueItemsFromBoard(owner, project) {
  heading('Removing linked issues from the board');
  const items = listProjectItems(owner, project);
  let removed = 0;
  for (const item of items) {
    if (item.content?.type !== 'Issue') continue;
    gh(['project', 'item-delete', project.number, '--owner', owner, '--id', item.id], {
      allowFailure: true,
    });
    removed += 1;
  }
  console.log(`  ${removed} issue items removed`);
}

// ---------------------------------------------------------------------------

function main() {
  const migrate = process.argv.includes('--migrate-from-issues');
  if (DRY_RUN) console.log('Running in dry-run mode; no changes will be made.\n');

  const owner = checkAuth();
  ensureRepo();
  ensureCollaborators();

  const project = ensureProject(backlog.projectOwner);
  const fields = ensureFields(backlog.projectOwner, project);
  extendStatusField(project, fields);

  if (migrate) {
    removeIssueItemsFromBoard(backlog.projectOwner, project);
    closeBacklogIssues();
  }

  ensureDraftItems(backlog.projectOwner, project, fields);

  console.log(`\nDone. Board: ${project.url}`);
  console.log('Group the board by Sprint (board view → Group by → Sprint).');
}

try {
  main();
} catch (error) {
  console.error(`\n${error.message}`);
  process.exit(1);
}

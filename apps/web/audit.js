const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const filesToAudit = [
  'apps/web/src/components/tenant/RoomForm.tsx',
  'apps/web/src/components/tenant/RoomList.tsx',
  'apps/web/src/components/properties/PropertyDetailView.tsx',
  'apps/web/src/components/properties/RoomSelector.tsx',
  'apps/web/src/components/properties/ImageLightbox.tsx',
  'apps/api/src/modules/rooms/rooms.service.ts',
  'apps/api/src/modules/rooms/rooms.controller.ts',
  'apps/api/src/middlewares/upload.middleware.ts',
];

function auditFile(filePath) {
  const absolutePath = path.resolve(
    '/Users/tuanstrange/Documents/Fullstack Engineer/Purwadhika Bootcamp/Final_Project/InapYuk',
    filePath,
  );
  if (!fs.existsSync(absolutePath)) {
    console.log(`Missing: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(absolutePath, 'utf8');
  const lines = content.split('\n');
  const fileLines = lines.length;

  console.log(
    `\n--- ${filePath} (${fileLines} lines) ${fileLines > 200 ? '❌ VIOLATION (File > 200 lines)' : '✅'} ---`,
  );

  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  let violations = 0;

  function visit(node) {
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isArrowFunction(node) ||
      ts.isFunctionExpression(node)
    ) {
      const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
      const numLines = end.line - start.line + 1;

      let name = 'Anonymous';
      if (node.name) {
        name = node.name.text;
      } else if (
        node.parent &&
        ts.isVariableDeclaration(node.parent) &&
        ts.isIdentifier(node.parent.name)
      ) {
        name = node.parent.name.text;
      } else if (
        node.parent &&
        ts.isPropertyAssignment(node.parent) &&
        ts.isIdentifier(node.parent.name)
      ) {
        name = node.parent.name.text;
      }

      if (numLines > 15) {
        console.log(
          `  ❌ Function '${name}' at line ${start.line + 1} has ${numLines} lines (> 15).`,
        );
        violations++;
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  if (violations === 0) {
    console.log('  ✅ All functions under 15 lines.');
  } else {
    console.log(`  Total function violations: ${violations}`);
  }
}

filesToAudit.forEach(auditFile);

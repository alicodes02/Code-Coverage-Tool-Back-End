const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { Project } = require('ts-morph');
const CORS = require('cors');
const archiver = require('archiver');

const app = express();
const port = 3001;

app.use(CORS());
app.use(express.static(path.join(__dirname, 'coverage/lcov-report/')));
app.use(bodyParser.text());

app.post('/generate-tests', (req, res) => {

  const code = req.body;

  
  const codeFilePath = path.join(__dirname, 'code.ts');
  fs.writeFileSync(codeFilePath, code);

  const testCases = generateTests(code);

  
  const tempTestFilePath = path.join(__dirname, 'tests/generated-tests.spec.ts');
  fs.writeFileSync(tempTestFilePath, testCases.join('\n'));

  const coveragePath = path.join(__dirname, 'coverage');
  const jestCommand = `npm test -- --config=jest.config.js --coverage`;

  exec(jestCommand, (error, stdout, stderr) => {

    console.log(`Jest output:\n${stdout}`);
    console.error(`Jest errors:\n${stderr}`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    const zipFilePath = path.join(__dirname, 'coverage-report.zip');
    const output = fs.createWriteStream(zipFilePath);

    archive.pipe(output);
    archive.directory(coveragePath, false);
    archive.finalize();

    res.setHeader('Content-Type', 'application/zip');

    res.setHeader('Content-Disposition', `attachment; filename=coverage-report.zip`);

    output.on('close', () => {
      const zipFileContent = fs.readFileSync(zipFilePath);
      res.send(zipFileContent);

      fs.unlinkSync(zipFilePath);
    });
  });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


function generateTests(code) {

  try {

    const codeFilePath = path.join(__dirname, 'code.ts');
    const codeFileContent = fs.readFileSync(codeFilePath, 'utf-8');

    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile('code.ts', codeFileContent);

    
    sourceFile.getFunctions().forEach((func) => {
      if (!func.hasExportKeyword()) {
        func.addModifier('export');
      }
    });

    const testCases = [];

sourceFile.getFunctions().forEach((func) => {
  const functionName = func.getName();
  const parameters = func.getParameters().map((param) => ({
    name: param.getName(),
    type: param.getType().getText(),
  }));

  
  for (let i = 0; i < 5; i++) {
    const randomValues = parameters.map((param) => {
      switch (param.type) {
        case 'number':
          return Math.floor(Math.random() * 100);
        case 'string':
          return `'${Math.random().toString(36).substring(7)}'`;
        case 'boolean':
          return Math.random() > 0.5; 
        case 'Array':
          return `[${Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => Math.floor(Math.random() * 100)).join(', ')}]`;
        default:
          return 'null';
      }
    });

    const testCase = `
      test('${functionName} - Case ${i + 1}', () => {
        const expectedValue = "";
        expect(${functionName}(${randomValues.join(', ')})).toBe(expectedValue);
      });
    `;

    testCases.push(testCase);
  }
});

    const importStatement = `import { ${sourceFile
      .getFunctions()
      .map((func) => func.getName())
      .join(', ')} } from '../code';`;

    fs.writeFileSync(codeFilePath, sourceFile.getFullText());

    return [importStatement, ...testCases];
    
  } catch (error) {
    console.error('Error generating tests:', error.message);
    return [];
  }
}

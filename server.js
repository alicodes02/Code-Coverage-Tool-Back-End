const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const { Project } = require('ts-morph');
const cors = require('cors');
const archiver = require('archiver');
const { Volume, createFsFromVolume } = require('memfs');

const app = express();
const port = process.env.PORT || 3001;

const volume = Volume.fromJSON({ /* initial file system state */ });
const memfs = createFsFromVolume(volume);

app.use(cors());
app.use(express.static(__dirname + '/coverage/lcov-report/'));
app.use(bodyParser.text());

app.get('/test', (req, res) => {
  res.status(200).send('API is active and running');
});

app.post('/generate-tests', (req, res) => {
  const code = req.body;

  const codeFilePath = '/code.ts';
  memfs.writeFileSync(codeFilePath, code);

  const testCases = generateTests(code);

  const tempTestFilePath = '/tests/generated-tests.spec.ts';
  memfs.writeFileSync(tempTestFilePath, testCases.join('\n'));

  const coveragePath = '/coverage';
  const jestCommand = `npm test -- --config=jest.config.js --coverage`;

  exec(jestCommand, (error, stdout, stderr) => {
    console.log(`Jest output:\n${stdout}`);
    console.error(`Jest errors:\n${stderr}`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    const zipFilePath = '/coverage-report.zip';
    const output = memfs.createWriteStream(zipFilePath);

    archive.pipe(output);
    archive.directory(coveragePath, false);
    archive.finalize();

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=coverage-report.zip`);

    output.on('close', () => {
      const zipFileContent = memfs.readFileSync(zipFilePath);
      res.send(zipFileContent);

      // Clean up in-memory file system
      memfs.rmdirSync('/tests', { recursive: true });
      memfs.unlinkSync(zipFilePath);
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

function generateTests(code) {
  try {
    const codeFilePath = '/code.ts';
    const codeFileContent = memfs.readFileSync(codeFilePath, 'utf-8');

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
              return `[${Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () =>
                Math.floor(Math.random() * 100)
              ).join(', ')}]`;
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

    memfs.writeFileSync(codeFilePath, sourceFile.getFullText());

    return [importStatement, ...testCases];
  } catch (error) {
    console.error('Error generating tests:', error.message);
    return [];
  }
}

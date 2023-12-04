const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { Project } = require('ts-morph');
const CORS = require('cors');

const app = express();
const port = 3001;

app.use(CORS());
app.use(express.static(path.join(__dirname, 'coverage/Icov-report')));
app.use(bodyParser.text());

app.post('/generate-tests', (req, res) => {
  const code = req.body;

  // Write TypeScript code to a separate file
  const codeFilePath = path.join(__dirname, 'code.ts');
  fs.writeFileSync(codeFilePath, code);

  // Generate Jest test cases
  const testCases = generateTests(code);

  // Create a temporary file for Jest test cases
  const tempTestFilePath = path.join(__dirname, 'tests/generated-tests.spec.ts');
  fs.writeFileSync(tempTestFilePath, testCases.join('\n'));

  // Run tests through Jest and collect coverage
  // Run tests through Jest and collect coverage
const coveragePath = path.join(__dirname, 'coverage');
const jestCommand = `npm test -- --config=jest.config.js --coverage`;

exec(jestCommand, (error, stdout, stderr) => {
  
  console.log(`Jest output:\n${stdout}`);
  console.error(`Jest errors:\n${stderr}`);

  // Read the content of index.html
  const indexPath = path.join(__dirname, '/coverage/lcov-report/index.html');
  const indexHtmlContent = fs.readFileSync(indexPath, 'utf-8');

  // Send the HTML content as the response
  res.send(indexHtmlContent);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


function generateTests(code) {
  try {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile('temp.ts', code);

    const testCases = sourceFile.getFunctions().map((func) => {
      const functionName = func.getName();
      const parameters = func.getParameters().map((param) => ({
        name: param.getName(),
        type: param.getType().getText(),
      }));

      const randomValues = parameters.map((param) => {
        switch (param.type) {
          case 'number':
            return Math.floor(Math.random() * 100);
          case 'string':
            return `'${Math.random().toString(36).substring(7)}'`;
          default:
            return 'null';
        }
      });

      const testCase = `
        test('${functionName}', () => {
          const expectedValue = "";
          expect(${functionName}(${randomValues.join(', ')})).toBe(expectedValue);
        });
      `;

      return testCase;
    });

    const importStatement = `import { ${sourceFile
      .getFunctions()
      .map((func) => func.getName())
      .join(', ')} } from '../code';`;

    return [importStatement, ...testCases];
  } catch (error) {
    console.error('Error generating tests:', error.message);
    // Return an empty array or handle the error as needed
    return [];
  }
}

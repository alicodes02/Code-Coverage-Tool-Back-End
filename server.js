const express = require('express');
const bodyParser = require('body-parser');
const { Project } = require('ts-morph');
const fs = require('fs');
const path = require('path');
const CORS = require('cors');

const app = express();
const port = 3001;

app.use(CORS());
app.use(bodyParser.text());

app.post('/generate-tests', (req, res) => {
  const code = req.body;

  // Parse TypeScript code and generate Jest test cases
  const generatedTests = generateTests(code);

  // Write test cases to a separate file
  const codeFilePath = path.join(__dirname, 'code.ts');
  const testFilePath = path.join(__dirname, 'tests/generated-tests.spec.ts');
  fs.writeFileSync(codeFilePath, code);
  fs.writeFileSync(testFilePath, generatedTests.join('\n'));

  // Send the path to the frontend
  res.json({ testFilePath });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Function to generate Jest test cases with random values
function generateTests(code) {
    const project = new Project({ useInMemoryFileSystem: true }); // Use in-memory file system
    const sourceFile = project.createSourceFile('temp.ts', code);
  
    const testCases = sourceFile.getFunctions().map((func) => {
      const functionName = func.getName();
      const parameters = func.getParameters().map((param) => ({
        name: param.getName(),
        type: param.getType().getText(),
      }));
  
      // Generate random values for parameters based on their types
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
  
      // Create Jest test case with random values
      const testCase = `
        test('${functionName}', () => {
          const expectedValue = 10 /* Set expected value based on the function logic */;
          expect(${functionName}(${randomValues.join(', ')})).toBe(expectedValue);
        });
      `;
  
      return testCase;
    });
  
    // Add import statement
    const importStatement = `import { ${sourceFile.getFunctions().map((func) => func.getName()).join(', ')} } from '../code';\n\n`;
  
    return [importStatement, ...testCases].join('\n');
  }
  
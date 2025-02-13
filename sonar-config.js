const scanner = require('sonarqube-scanner').default;

scanner(
  {
    serverUrl: 'https://sonarcloud.io',
    token: '8157412164522b64660f5fad075c4f7ae562bc9e',
    options: {
      'sonar.projectKey': 'pos-tech-soat08-03_easyOrder-challenge4-app-core',
      'sonar.organization' : 'pos-tech-soat08-03',
      'sonar.sources': './src',
      'sonar.exclusions': '**/tests/**,src/app.ts,src/swagger.ts,MySQLConnection.ts',
      'sonar.tests': './src/tests',
      'sonar.test.inclusions': './src/tests/**/*.test.tsx,./src/tests/**/*.test.ts',
      'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info',
    },
  },
  error => {
    if (error) {
      console.error(error);
    }
    process.exit();
  },
);

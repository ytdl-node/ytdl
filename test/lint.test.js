const { CLIEngine } = require('eslint');
const assert = require('assert');

const cli = new CLIEngine({ useEslintrc: true });

const report = cli.executeOnFiles(['src/', 'test/']);

describe('Lint', () => {
    it('Check for linting errors', () => {
        assert.equal(report.errorCount, 0);
    });
});

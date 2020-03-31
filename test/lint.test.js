const { CLIEngine } = require('eslint');
const assert = require('assert');

const cli = new CLIEngine({ useEslintrc: true });

const report = cli.executeOnFiles(['src/', 'test/']);

describe('Lint', () => {
    it('Check for linting errors', (done) => {
        try {
            assert.equal(report.errorCount, 0);
            done();
        } catch (err) {
            const errorFiles = [];
            report.results.forEach((i) => {
                if (i.errorCount !== 0) {
                    errorFiles.push(`\n\t${i.filePath}`);
                }
            });
            throw new Error(errorFiles);
        }
    });
});

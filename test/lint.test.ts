import { CLIEngine } from 'eslint';
import { expect } from 'chai';


describe('Lint', () => {
    it('Check for linting errors', () => {
        const cli = new CLIEngine({ useEslintrc: true });
        const report = cli.executeOnFiles(['src/**/*.ts', 'test/**/*.ts']);
        try {
            expect(report.errorCount).to.equal(0);
        } catch (err) {
            const errorFiles: string[] = [];
            report.results.forEach((result) => {
                if (result.errorCount !== 0) {
                    errorFiles.push(`\n\t${result.filePath}`);
                }
            });
            const lintError = new Error(errorFiles.toString());
            lintError.name = 'LintError';
            throw lintError;
        }
    });
});

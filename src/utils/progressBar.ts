import { Logger } from 'winston';
import * as readline from 'readline';

export default class ProgressBar {
    total: number;

    current: number;

    readonly preText: string;

    private readonly barLength: number;

    private readonly logger: Logger;

    constructor(total: number, preText?: string, logger?: Logger) {
        this.total = total;
        this.current = 0;
        this.preText = preText || 'Current progress';
        this.logger = logger;

        const { columns } = process.stdout;
        this.barLength = columns <= 75 ? columns - 30 : 45;

        this.update(this.current);
    }

    /**
     * Function updates the progress bar, adding # to proceed.
     * @param newLength Stores the length to be updated by
     */
    public update(newLength: number): string {
        this.current += newLength;
        const currentProgress = this.current / this.total;
        const filledBarLength: number = Number((currentProgress * this.barLength).toFixed(0));
        const emptyBarLength = this.barLength - filledBarLength;
        const percentageProgress = (currentProgress * 100).toFixed(2);

        if (filledBarLength <= this.barLength && Number(percentageProgress) <= 100) {
            this.draw(filledBarLength, emptyBarLength, percentageProgress);
            return 'full';
        }
        return 'filling';
    }

    /**
     * Draws the bar on stdout
     * @param filledBarLength Stores length of filled bar
     * @param emptyBarLength Stores length of remaining bar
     * @param percentageProgress Stores progress in percentage
     */
    private draw(
        filledBarLength: number,
        emptyBarLength: number,
        percentageProgress: string,
    ): void {
        const filledBar = '#'.repeat(filledBarLength);
        const emptyBar = '.'.repeat(emptyBarLength);

        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);

        if (this.logger) {
            const { error, warn, ...acceptedLevels } = this.logger.levels;
            if (acceptedLevels[this.logger.level]) {
                if (percentageProgress === '0.00') {
                    process.stdout.write('\n');
                }

                process.stdout.write(
                    `${this.preText}: [${filledBar}${emptyBar}] | ${percentageProgress}%`,
                );

                if (percentageProgress === '100.00') {
                    process.stdout.write('\n\n');
                }
            }
        }
    }
}

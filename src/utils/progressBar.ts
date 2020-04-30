import { Logger } from 'winston';

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

    public update(current: number): string {
        this.current += current;
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

    private draw(
        filledBarLength: number,
        emptyBarLength: number,
        percentageProgress: string,
    ): void {
        const filledBar = ProgressBar.getBar(filledBarLength, '#');
        const emptyBar = ProgressBar.getBar(emptyBarLength, ' ');

        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);

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

    private static getBar(length: number, char: string): string {
        let bar = '';
        for (let i = 0; i < length; i += 1) {
            bar += char;
        }
        return bar;
    }
}

const { Command } = require('commander');
const logger = require('./utils/logger');

function setOptions(program) {
    program
        .option('-d, --debug', 'output extra debugging');
}

function parseOptions(program) {
    if (program.debug) {
        logger.info(program.opts());
    }
}

function cli(args) {
    const program = new Command();

    setOptions(program);
    program.parse(args);
    parseOptions(program);
}

module.exports = {
    cli,
};

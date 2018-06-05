import path = require('path');
import tl = require('vsts-task-lib/task');
import trm = require('vsts-task-lib/toolrunner');
import mod = require('./taskmod');

async function run() {
    try {
        console.log(process.env["INPUT_SAMPLESTRING"]);

        tl.setResourcePath(path.join(__dirname, 'task.json'));

        let signingOption: string = tl.getInput('signingOption', true);

        let tool: trm.ToolRunner;
        if (process.platform == 'win32') {
            let cmdPath = tl.which('cmd');
            tool = tl.tool(cmdPath).arg('/c').arg('echo ' + tl.getInput('samplestring', true));
        }
        else {
            let echoPath = tl.which('echo');
            tool = tl.tool(echoPath).arg(tl.getInput('samplestring', true));
        }

        let rc1: number = await tool.exec();
        
        // call some module which does external work
        if (rc1 == 0) {
            mod.sayHello();
        }
        
        tl.setResult(tl.TaskResult.Succeeded, tl.loc('BashReturnCode', code));
        console.log('Task done! ' + rc1);
    }
    catch (err) {
        tl.error(err.message);
        // tl.setResult(tl.TaskResult.Failed, err.message);
        tl.setResult(tl.TaskResult.Failed, tl.loc('BashFailed', err.message));
    }
}

run();
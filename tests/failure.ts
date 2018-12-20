import path = require('path');
import ma = require('vsts-task-lib/mock-answer');
import tmrm = require('vsts-task-lib/mock-run');

const taskPath = path.join(__dirname, '..\\src\\NetFramework', 'index.js');
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tmr.setInput('samplestring', 'Hello, from task!');
tmr.setInput('samplebool', 'true');

// // provide answers for task mock
// const a: ma.TaskLibAnswers = {
//     which: {
//         echo: '/mocked/tools/echo',
//         cmd: '/mocked/tools/cmd',
//     },
//     exec: {
//         '/mocked/tools/echo Hello, from task!': {
//             code: 1,
//             stdout: 'atool output here',
//             stderr: 'atool with this stderr output',
//         },
//         '/mocked/tools/cmd /c echo Hello, from task!': {
//             code: 1,
//             stdout: 'atool output here',
//             stderr: 'atool with this stderr output',
//         },
//     },
// } as ma.TaskLibAnswers;
// tmr.setAnswers(a);

// // mock a specific module function called in task
// tmr.registerMock('./taskmod', {
//     sayHello() {
//         console.log('Hello Mock!');
//     },
// });

tmr.run();

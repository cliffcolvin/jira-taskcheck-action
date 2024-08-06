"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
async function run() {
    var _a, _b;
    try {
        const projectKey = core.getInput('project_key', { required: true });
        const check = core.getInput('check') || 'both';
        const prTitle = ((_a = github.context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.title) || '';
        const prBody = ((_b = github.context.payload.pull_request) === null || _b === void 0 ? void 0 : _b.body) || '';
        const taskPattern = new RegExp(`${projectKey}-\\d+`);
        let taskFound = false;
        if (check === 'both' || check === 'title') {
            taskFound = taskFound || taskPattern.test(prTitle);
        }
        if (check === 'both' || check === 'description') {
            taskFound = taskFound || taskPattern.test(prBody);
        }
        if (!taskFound) {
            let location;
            switch (check) {
                case 'title':
                    location = 'the title';
                    break;
                case 'description':
                    location = 'the description';
                    break;
                default:
                    location = 'either the title or description';
            }
            core.setFailed(`PR must include a task number in the format ${projectKey}-XXXX in ${location}.`);
        }
        else {
            core.info(`Task number found in PR ${check === 'both' ? 'title or description' : check}.`);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            core.setFailed('An unexpected error occurred');
        }
    }
}
// Only run the function if this file is being executed directly
if (require.main === module) {
    run();
}

import * as core from '@actions/core';
import * as github from '@actions/github';

export async function run(): Promise<void> {
  try {
    const projectKey = core.getInput('project_key', { required: true });
    const check = core.getInput('check') || 'both';
    const prTitle = github.context.payload.pull_request?.title || '';
    const prBody = github.context.payload.pull_request?.body || '';

    const taskPattern = new RegExp(`\\b${projectKey}-\\d+\\b`);

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
    } else {
      if (check === 'both') {
        core.info('Task number found in PR title or description.');
      } else {
        core.info(`Task number found in PR ${check}.`);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred');
    }
  }
}

// Only run the function if this file is being executed directly
if (require.main === module) {
  run();
}
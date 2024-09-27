import * as core from '@actions/core';
import * as github from '@actions/github';

export async function run(): Promise<void> {
  try {
    const projectKey = core.getInput('project_key', { required: true });
    const check = core.getInput('check') || 'both';
    const token = core.getInput('github_token', { required: true });

    const octokit = github.getOctokit(token);

    // Fetch the latest PR information
    const { data: pullRequest } = await octokit.rest.pulls.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: github.context.issue.number,
    });

    const prTitle = pullRequest.title || '';
    const prBody = pullRequest.body || '';

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
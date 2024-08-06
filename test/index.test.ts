import * as core from '@actions/core';
import * as github from '@actions/github';
import { run } from '../src';

jest.mock('@actions/core');
jest.mock('@actions/github');

// Add these type assertions
const mockedCore = core as jest.Mocked<typeof core>;
const mockedGithub = github as jest.Mocked<typeof github>;

describe('PR Task Number Checker', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (mockedGithub.context.payload.pull_request as any) = {};
    (mockedCore.getInput as jest.Mock).mockImplementation((name) => {
      if (name === 'project_key') return 'ABC';
      if (name === 'check') return 'both';
      return '';
    });
  });

  test('should pass when task number is in PR title', async () => {
    mockedCore.getInput.mockImplementation((name) => {
      if (name === 'project_key') return 'ABC';
      if (name === 'check') return 'both';
      return '';
    });
    mockedGithub.context.payload.pull_request = {
      title: 'ABC-123: Add new feature',
      body: 'This is the PR body'
    } as any;

    await run();
    
    expect(mockedCore.setFailed).not.toHaveBeenCalled();
    expect(mockedCore.info).toHaveBeenCalledWith('Task number found in PR title or description.');
    
    // Debugging
    if (mockedCore.setFailed.mock.calls.length > 0) {
      console.log('setFailed was called with:', mockedCore.setFailed.mock.calls[0][0]);
    }
  });

  test('should pass when task number is in PR body', async () => {
    (mockedCore.getInput as jest.Mock).mockImplementation((name) => {
      if (name === 'project_key') return 'XYZ';
      if (name === 'check') return 'both';
      return '';
    });
    mockedGithub.context.payload.pull_request!.title = 'Add new feature';
    mockedGithub.context.payload.pull_request!.body = 'Implements task XYZ-456';

    await run();

    expect(mockedCore.setFailed).not.toHaveBeenCalled();
    expect(mockedCore.info).toHaveBeenCalledWith('Task number found in PR title or description.');
  });

  test('should fail when task number is missing from both title and body', async () => {
    (mockedCore.getInput as jest.Mock).mockImplementation((name) => {
      if (name === 'project_key') return 'PRJ';
      if (name === 'check') return 'both';
      return '';
    });
    mockedGithub.context.payload.pull_request!.title = 'Add new feature';
    mockedGithub.context.payload.pull_request!.body = 'This PR adds a new feature';

    await run();

    expect(mockedCore.setFailed).toHaveBeenCalledWith('PR must include a task number in the format PRJ-XXXX in either the title or description.');
  });

  test('should handle missing PR title and body', async () => {
    (mockedCore.getInput as jest.Mock).mockReturnValue('TST');

    await run();

    expect(mockedCore.setFailed).toHaveBeenCalledWith('PR must include a task number in the format TST-XXXX in either the title or description.');
  });

  test('should handle errors and set failed status', async () => {
    (mockedCore.getInput as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });

    await run();

    expect(mockedCore.setFailed).toHaveBeenCalledWith('Test error');
  });

  test('should handle unexpected errors', async () => {
    (mockedCore.getInput as jest.Mock).mockImplementation(() => {
      throw 'Unexpected error';
    });

    await run();

    expect(mockedCore.setFailed).toHaveBeenCalledWith('An unexpected error occurred');
  });

  test('should pass when task number is in PR title and check is set to title', async () => {
    (mockedCore.getInput as jest.Mock).mockImplementation((name) => {
      if (name === 'project_key') return 'ABC';
      if (name === 'check') return 'title';
      return '';
    });
    mockedGithub.context.payload.pull_request!.title = 'ABC-123: Add new feature';
    mockedGithub.context.payload.pull_request!.body = 'This PR adds a new feature';

    await run();

    expect(mockedCore.setFailed).not.toHaveBeenCalled();
    expect(mockedCore.info).toHaveBeenCalledWith('Task number found in PR title.');
  });

  test('should fail when task number is in PR body but check is set to title', async () => {
    (mockedCore.getInput as jest.Mock).mockImplementation((name) => {
      if (name === 'project_key') return 'ABC';
      if (name === 'check') return 'title';
      return '';
    });
    mockedGithub.context.payload.pull_request!.title = 'Add new feature';
    mockedGithub.context.payload.pull_request!.body = 'Implements task ABC-456';

    await run();

    expect(mockedCore.setFailed).toHaveBeenCalledWith('PR must include a task number in the format ABC-XXXX in the title.');
  });

  test('should pass when task number is in PR body and check is set to description', async () => {
    (mockedCore.getInput as jest.Mock).mockImplementation((name) => {
      if (name === 'project_key') return 'ABC';
      if (name === 'check') return 'description';
      return '';
    });
    mockedGithub.context.payload.pull_request!.title = 'Add new feature';
    mockedGithub.context.payload.pull_request!.body = 'Implements task ABC-456';

    await run();

    expect(mockedCore.setFailed).not.toHaveBeenCalled();
    expect(mockedCore.info).toHaveBeenCalledWith('Task number found in PR description.');
  });

  test('should fail when task number is in PR title but check is set to description', async () => {
    (mockedCore.getInput as jest.Mock).mockImplementation((name) => {
      if (name === 'project_key') return 'ABC';
      if (name === 'check') return 'description';
      return '';
    });
    mockedGithub.context.payload.pull_request!.title = 'ABC-123: Add new feature';
    mockedGithub.context.payload.pull_request!.body = 'This PR adds a new feature';

    await run();

    expect(mockedCore.setFailed).toHaveBeenCalledWith('PR must include a task number in the format ABC-XXXX in the description.');
  });
});
import * as core from '@actions/core';
import * as github from '@actions/github';
import { run } from '../src';

jest.mock('@actions/core');
jest.mock('@actions/github');

const mockedCore = core as jest.Mocked<typeof core>;
const mockedGithub = github as jest.Mocked<typeof github>;

describe('PR Task Number Checker', () => {
  let mockOctokit: any;

  beforeEach(() => {
    jest.resetAllMocks();
    mockOctokit = {
      rest: {
        pulls: {
          get: jest.fn(),
        },
      },
    };
    (mockedGithub.getOctokit as jest.Mock).mockReturnValue(mockOctokit);
    (mockedGithub.context as any) = {
      repo: { owner: 'testOwner', repo: 'testRepo' },
      issue: { number: 1 },
    };
    (mockedCore.getInput as jest.Mock).mockImplementation((name) => {
      if (name === 'project_key') return 'ABC';
      if (name === 'check') return 'both';
      if (name === 'github_token') return 'fake-token';
      return '';
    });
  });

  test('should pass when task number is in PR title', async () => {
    mockOctokit.rest.pulls.get.mockResolvedValue({
      data: {
        title: 'ABC-123: Add new feature',
        body: 'This is the PR body',
      },
    });

    await run();
    
    expect(mockedCore.setFailed).not.toHaveBeenCalled();
    expect(mockedCore.info).toHaveBeenCalledWith('Task number found in PR title or description.');
  });

  test('should pass when task number is in PR body', async () => {
    (mockedCore.getInput as jest.Mock).mockImplementation((name) => {
      if (name === 'project_key') return 'XYZ';
      if (name === 'check') return 'both';
      if (name === 'github_token') return 'fake-token';
      return '';
    });
    mockOctokit.rest.pulls.get.mockResolvedValue({
      data: {
        title: 'Add new feature',
        body: 'Implements task XYZ-456',
      },
    });

    await run();

    expect(mockedCore.setFailed).not.toHaveBeenCalled();
    expect(mockedCore.info).toHaveBeenCalledWith('Task number found in PR title or description.');
  });

  test('should fail when task number is missing from both title and body', async () => {
    (mockedCore.getInput as jest.Mock).mockImplementation((name) => {
      if (name === 'project_key') return 'PRJ';
      if (name === 'check') return 'both';
      if (name === 'github_token') return 'fake-token';
      return '';
    });
    mockOctokit.rest.pulls.get.mockResolvedValue({
      data: {
        title: 'Add new feature',
        body: 'This PR adds a new feature',
      },
    });

    await run();

    expect(mockedCore.setFailed).toHaveBeenCalledWith('PR must include a task number in the format PRJ-XXXX in either the title or description.');
  });

  test('should handle missing PR title and body', async () => {
    (mockedCore.getInput as jest.Mock).mockImplementation((name) => {
      if (name === 'project_key') return 'TST';
      if (name === 'check') return 'both';
      if (name === 'github_token') return 'fake-token';
      return '';
    });
    mockOctokit.rest.pulls.get.mockResolvedValue({
      data: {
        title: '',
        body: '',
      },
    });

    await run();

    expect(mockedCore.setFailed).toHaveBeenCalledWith('PR must include a task number in the format TST-XXXX in either the title or description.');
  });

  test('should handle errors and set failed status', async () => {
    mockOctokit.rest.pulls.get.mockRejectedValue(new Error('API Error'));

    await run();

    expect(mockedCore.setFailed).toHaveBeenCalledWith('API Error');
  });

  test('should handle unexpected errors', async () => {
    (mockedCore.getInput as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    await run();

    expect(mockedCore.setFailed).toHaveBeenCalledWith('Unexpected error');
  });

  test('should pass when task number is in PR title and check is set to title', async () => {
    (mockedCore.getInput as jest.Mock).mockImplementation((name) => {
      if (name === 'project_key') return 'ABC';
      if (name === 'check') return 'title';
      if (name === 'github_token') return 'fake-token';
      return '';
    });
    mockOctokit.rest.pulls.get.mockResolvedValue({
      data: {
        title: 'ABC-123: Add new feature',
        body: 'This PR adds a new feature',
      },
    });

    await run();

    expect(mockedCore.setFailed).not.toHaveBeenCalled();
    expect(mockedCore.info).toHaveBeenCalledWith('Task number found in PR title.');
  });

  test('should fail when task number is in PR body but check is set to title', async () => {
    (mockedCore.getInput as jest.Mock).mockImplementation((name) => {
      if (name === 'project_key') return 'ABC';
      if (name === 'check') return 'title';
      if (name === 'github_token') return 'fake-token';
      return '';
    });
    mockOctokit.rest.pulls.get.mockResolvedValue({
      data: {
        title: 'Add new feature',
        body: 'Implements task ABC-456',
      },
    });

    await run();

    expect(mockedCore.setFailed).toHaveBeenCalledWith('PR must include a task number in the format ABC-XXXX in the title.');
  });

  test('should pass when task number is in PR body and check is set to description', async () => {
    (mockedCore.getInput as jest.Mock).mockImplementation((name) => {
      if (name === 'project_key') return 'ABC';
      if (name === 'check') return 'description';
      if (name === 'github_token') return 'fake-token';
      return '';
    });
    mockOctokit.rest.pulls.get.mockResolvedValue({
      data: {
        title: 'Add new feature',
        body: 'Implements task ABC-456',
      },
    });

    await run();

    expect(mockedCore.setFailed).not.toHaveBeenCalled();
    expect(mockedCore.info).toHaveBeenCalledWith('Task number found in PR description.');
  });

  test('should fail when task number is in PR title but check is set to description', async () => {
    (mockedCore.getInput as jest.Mock).mockImplementation((name) => {
      if (name === 'project_key') return 'ABC';
      if (name === 'check') return 'description';
      if (name === 'github_token') return 'fake-token';
      return '';
    });
    mockOctokit.rest.pulls.get.mockResolvedValue({
      data: {
        title: 'ABC-123: Add new feature',
        body: 'This PR adds a new feature',
      },
    });

    await run();

    expect(mockedCore.setFailed).toHaveBeenCalledWith('PR must include a task number in the format ABC-XXXX in the description.');
  });
});
# jira-taskcheck-action

A GitHub Action to check if Pull Request titles and/or descriptions contain a Jira task number.

## Description

This action helps maintain a consistent workflow by ensuring that Pull Requests are properly linked to Jira tasks. It checks the PR title and/or description for a valid Jira task number based on your configuration.

## Usage

To use this action in your workflow, add the following step to your `.github/workflows/main.yml` file:

```yaml
- name: Check Jira Task Number
  uses: your-username/jira-taskcheck-action@v1
  with:
    # Required: specify the Jira project key
    project_key: 'ABC'
    # Optional: specify the Jira task number pattern to match
    jira-task-pattern: '^(?:[A-Z]+-\\d+|\\d+)$'
    # Optional: specify whether to check the title, description, or both
    check: 'title'
```

The `project_key` input is mandatory and should be set to your Jira project key.

You can customize the `jira-task-pattern` input to match your specific Jira task number format. The default pattern matches common Jira task number formats like `ABC-123` or `123`.

The `check` input allows you to specify whether to check the Pull Request title, description, or both. Valid values are `title`, `description`, or `both`.

For example, to check both the title and description for a Jira task number, you can use:

```yaml
- name: Check Jira Task Number
  uses: your-username/jira-taskcheck-action@v1
  with:
    project_key: 'ABC'
    check: 'both'
```

If the Pull Request title and/or description does not contain a valid Jira task number, the action will fail and provide an error message.

## Example Workflow

Here's an example workflow file that demonstrates how to use this action:
```yaml
name: Check Jira Task Number

on:
  pull_request:
    branches:
      - main

jobs:
  check-jira-task:
    runs-on: ubuntu-latest
    steps:
      - name: Check Jira Task Number
        uses: your-username/jira-taskcheck-action@v1
        with:
          project_key: 'ABC'  # Required: specify your Jira project key
          check: 'both'
```
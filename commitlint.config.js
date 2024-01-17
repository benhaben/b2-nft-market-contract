module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    // type是必填项
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert'
      ]
    ],

    // subject行长度为72个字符最长
    'header-max-length': [2, 'always', 72],

    // 要求body和footer不能为空
    'body-empty': [2, 'never'],
    'footer-empty': [2, 'never']
  }
}
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // .worktrees/*: 개발용 git worktree가 리포 안에 있으면 jest가 그 안의 테스트까지
  // 수집한다. 워크트리의 '@/' 별칭은 여기 rootDir로 잘못 풀려 통과할 수 없는
  // 실패를 만든다 (eslint에도 같은 이유로 ignore가 걸려 있다).
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/', '<rootDir>/.worktrees/'],
};

module.exports = createJestConfig(customJestConfig);

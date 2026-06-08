# WebGAL Parser: The Next Generation

## Development

### Run all tests

```sh
yarn test
```

### Run a specific test

```sh
yarn test -t TEST_NAME
```

### Trace the parsing process

Since this print a verbose test tree, we typically use for a specific test:

```sh
yarn test-trace -t TEST_NAME
```

Or, if all tests are needed:

```sh
yarn test-trace
```

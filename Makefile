test:
	@node node_modules/lab/bin/lab -m 10000
test-cov:
	@node node_modules/lab/bin/lab -t 100 -v -m 10000
test-cov-json:
	@node node_modules/lab/bin/lab -r json -o coverage.json -m 10000

.PHONY: test test-cov test-cov-json

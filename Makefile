test:
	@node node_modules/lab/bin/lab -m 30000
test-cov:
	@node node_modules/lab/bin/lab -t 99 -v -m 30000
test-cov-json:
	@node node_modules/lab/bin/lab -r json -o coverage.json -m 30000

.PHONY: test test-cov test-cov-json

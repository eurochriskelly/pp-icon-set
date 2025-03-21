.PHONY: help export

help:
	@echo "Available commands:"
	@echo "  make help    - Show this help message"
	@echo "  make export  - Run the src/index.js script"

export: bin/export-icons.js
	@echo "Exporting icons..."
	@rm -rf out/
	@node bin/export-icons.js
	@ls -lG out/*.svg
	@echo "Export complete"

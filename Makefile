test-frontend:
	cd src/frontend && yarn test

setup-frontend: install-browser-frontend

install-browser-frontend:
	cd src/frontend && yarn playwright-cli install-browser chromium

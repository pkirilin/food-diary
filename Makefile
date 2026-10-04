setup-frontend: install-browser-frontend

install-browser-frontend:
	cd src/frontend && yarn playwright-cli install-browser chromium

refresh-lockfiles: refresh-lockfiles-frontend refresh-lockfiles-e2e-tests

refresh-lockfiles-frontend:
	cd src/frontend && yarn refresh-lockfiles
refresh-lockfiles-e2e-tests:
	cd tests && yarn refresh-lockfiles

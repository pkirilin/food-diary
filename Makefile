refresh-lockfiles: refresh-lockfiles-frontend refresh-lockfiles-e2e-tests

refresh-lockfiles-frontend:
	cd src/frontend && yarn refresh-lockfiles
refresh-lockfiles-e2e-tests:
	cd tests && yarn refresh-lockfiles

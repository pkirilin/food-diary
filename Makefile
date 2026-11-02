test-frontend:
	cd src/frontend && yarn test

test-frontend-quiet:
	cd src/frontend && DEBUG_PRINT_LIMIT=0 NO_COLOR=1 yarn test --run $(FILE) $(if $(NAME),-t "$(NAME)")

start-frontend-msw:
	@if lsof -nP -iTCP:5173 -sTCP:LISTEN >/dev/null; then \
		echo "Port 5173 is in use: nothing started."; \
	else \
		cd src/frontend && VITE_APP_MSW_ENABLED=true VITE_APP_FAKE_AUTH_ENABLED=true VITE_APP_FAKE_AUTH_LOGIN_ON_INIT=true yarn start; \
	fi

setup-frontend: install-browser-frontend

install-browser-frontend:
	cd src/frontend && yarn playwright-cli install-browser chromium

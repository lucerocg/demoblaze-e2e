cat > README.md << 'EOF'
    # Demoblaze E2E (Playwright + TypeScript)

    ## Instalación
    npm ci
    npx playwright install --with-deps

    ## Ejecutar
    npx playwright test
    npx playwright test --headed
    npx playwright show-report
    EOF 
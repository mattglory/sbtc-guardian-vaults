@echo off
echo ========================================
echo Fixing Wallet Connection Issues
echo ========================================
echo.

echo Step 1: Removing problematic polyfill plugins...
call npm uninstall vite-plugin-node-polyfills @esbuild-plugins/node-globals-polyfill @esbuild-plugins/node-modules-polyfill rollup-plugin-polyfill-node 2>nul
echo Done!
echo.

echo Step 2: Ensuring process polyfill is installed...
call npm install process
echo Done!
echo.

echo Step 3: Clearing Vite cache...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo Cache cleared!
) else (
    echo No cache to clear.
)
echo.

if exist "dist" (
    rmdir /s /q "dist"
    echo Build folder cleared!
)
echo.

echo Step 4: Starting dev server...
echo ========================================
echo You can now test the wallet connection!
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run dev

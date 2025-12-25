@echo off
REM Inicia backend
start /min "Backend" cmd /k "d: && cd \contrato\controlepg\backend && node server.cjs"

REM Inicia frontend apontando para o backend
rem set VITE_API_URL=http://192.168.99.110:5432
start /min "Frontend" cmd /k "d: && cd \contrato\controlepg && quasar dev"
exit
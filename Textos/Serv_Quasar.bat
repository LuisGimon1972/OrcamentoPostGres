@echo off
start /min "Backend" cmd /k "c: && cd \quasar-project\backend && node server.cjs"
start /min "Frontend" cmd /k "c: && cd \quasar-project && quasar dev"
exit
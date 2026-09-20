# Certs

These files are used for local development and testing under https.

## How to generate certs

Generate pfx:

```shell
dotnet dev-certs https -ep app.pfx -p test
```

Generate crt (*use your operation system password here*):

```shell
dotnet dev-certs https --trust --export-path ca.cert.crt
```

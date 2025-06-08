Сборка образа:
```bash
docker build -t ozna-react-frontend .
```

Запуск контейнера (зависим от backend, localhost):
```bash
docker run --name ozna-react-frontend -p 80:80 ozna-react-frontend
```

Рабочая ссылка после запуска:
```
http://localhost
```

Остановка контейнера:
```
Ctrl+C
```

Главный репозиторий:
https://github.com/ahmadeev/ozna-app

---

Рабочая ссылка после запуска:
http://localhost

---

Сборка образа:
```bash
docker build -t ozna-react-frontend .
```

Запуск контейнера (зависим от backend, localhost):
```bash
docker run --name ozna-react-frontend -p 80:80 ozna-react-frontend
```

Остановка контейнера:
```
Ctrl+C
```

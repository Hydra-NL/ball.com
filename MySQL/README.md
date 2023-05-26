## MySQL draaien via Docker

1. Navigeer naar de MySQL folder
2. Build de MySQL Docker image: `docker build -t mysql-image .`
3. Start een Docker-container met de nieuwe image: `docker run -d --name mysql-container -v /path/to/host/mysql-data:/var/lib/mysql -p 3306:3306 mysql-image`
4. MySQL is nu toegankelijk met de volgende gegevens:

- Database: ballcom
- Username: administrator
- Password: password123
- Host: localhost:3306

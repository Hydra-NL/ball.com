#!/bin/sh

# Functie om database te initialiseren
create_database() {
    mysql -u root --password=myrootpassword -e "CREATE DATABASE IF NOT EXISTS ballcom;"
}

# Functie om gebruiker toe te voegen
create_user() {
    mysql -u root --password=myrootpassword -e "CREATE USER IF NOT EXISTS 'administrator'@'%' IDENTIFIED BY 'password123';"
    mysql -u root --password=myrootpassword -e "GRANT ALL PRIVILEGES ON ballcom.* TO 'administrator'@'%';"
    mysql -u root --password=myrootpassword -e "FLUSH PRIVILEGES;"
}

create_database
create_user
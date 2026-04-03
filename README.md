# Apache AGE Experiment
[![License](https://img.shields.io/github/license/tomdewildt/apache-age-experiment)](https://github.com/tomdewildt/apache-age-experiment/blob/master/LICENSE)

Experiments using the [Apache AGE](https://age.apache.org/) graph database extension for [PostgreSQL](https://www.postgresql.org/).

# How To Run

Prerequisites:
* mise version ```2025.1.0``` or later
* node version ```24.0.0``` or later
* docker version ```27.0.0``` or later

### Development

1. Run ```mise run init``` to initialize the environment.
2. Run ```mise run db:start``` to start the database.
3. Run ```mise run db:migrate``` to run the database migrations.
4. Run ```mise run run``` to start the application.

# References

[Apache AGE Docs](https://age.apache.org/age-manual/master/index.html)

[Apache AGE Viewer Docs](https://github.com/apache/age-viewer)

[PostgreSQL Docs](https://www.postgresql.org/docs/)

[Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)

[Drizzle Kit Docs](https://orm.drizzle.team/kit-docs/overview)

[Docker Compose Docs](https://docs.docker.com/compose/)

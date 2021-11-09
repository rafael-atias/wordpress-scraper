# README

This project is a program that retrieves the latest posts from a Wordpress blog. It is a personal project based on a need in my actual job: the need to sign in to a lot of blogs to check if our writers published the content the company asked them to. So, this project is an attempt to automatize that task

First, the program determines if the Wordpress REST API is active. If it is, then it requests the latest posts written by an specific author.

If the REST API is not available, then the program will scrape the content from the web. The web scraper will open a Chrome instance and, given the right credentials, sign in to the blog. Then, the browser will retrieve the latest published or scheduled posts written by an specific author.

Only are considered relevant the following data for each post:

- title
- url
- status (only interested in published and scheduled posts)
- publishing date

The program will retrieve the latest posts written with the username used to sign in or with a different username.
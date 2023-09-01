# Poster

Welcome to Poster! Poster is a social media platform that allows users to connect, share posts, and engage with content. It offers features such as user registration, authentication, posting images with captions, liking posts, commenting, and more. With a user-friendly interface and interactive features, Poster aims to bring people together in a digital social space..

## Backend API Documentation

This document provides an overview of the backend API for Poster. The API handles user authentication, post management, comments, and likes.

## Getting Started

1. Clone the repository.
2. Set up your development environment.
3. Run the project using [dotnet run].
4. Access the API endpoints using [api/poster].

## Usage

1. Create a user account using `POST /api/poster/users/create`.
2. Authenticate and get a JWT token using `POST /api/poster/users/login`.
3. Use the token for authorized endpoints (e.g., `GET /api/poster/posts`, `POST /api/poster/posts/create`).

## API Endpoints

### Authentication

- `POST /api/poster/users/create` - Create a new user account.
- `POST /api/poster/users/login` - Authenticate a user and generate a JWT token.

### Posts

- `GET /api/poster/posts` - Retrieve all posts.
- `GET /api/poster/posts/{id}` - Retrieve details of a specific post.
- `POST /api/poster/posts/create` - Create a new post.
- `DELETE /api/poster/posts/delete/{id}` - Delete a user's own post.
- `GET /api/poster/users/{userId}/posts` - Retrieve posts by a specific user.

### Likes

- `GET /api/poster/posts/{id}/likes` - Retrieve likes for a specific post.
- `POST /api/poster/posts/{id}/likes/create` - Like a post.
- `DELETE /api/poster/posts/{id}/likes/delete` - Remove a like from a post.

### Comments

- `GET /api/poster/posts/{id}/comments` - Retrieve comments for a specific post.
- `POST /api/poster/posts/{id}/comments/create` - Add a comment to a post.

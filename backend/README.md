# DegenMonk Backend

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```bash
PORT=3001
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
```

3. Start the development server:
```bash
npm start
```

## Docker Development

1. Build the Docker image:
```bash
docker build -t degenmonk-backend .
```

2. Run the container:
```bash
docker run -p 3001:3001 \
  -e DB_USER=your_db_user \
  -e DB_HOST=your_db_host \
  -e DB_NAME=your_db_name \
  -e DB_PASSWORD=your_db_password \
  -e DB_PORT=5432 \
  -e PORT=3001 \
  degenmonk-backend
```

## Production Deployment

The application is automatically deployed to EC2 using GitHub Actions when changes are pushed to the main branch. The deployment process:

1. Builds Docker images for both frontend and backend
2. Pushes images to Amazon ECR
3. Deploys containers to EC2 instance

### Required GitHub Secrets

The following secrets must be configured in GitHub:

- `AWS_ACCESS_KEY_ID`: AWS access key for ECR access
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for ECR access
- `EC2_HOST`: EC2 instance hostname
- `SSH_PRIVATE_KEY`: SSH key for EC2 access
- `DB_PASSWORD`: Database password

### API Endpoints

- `GET /api` - Root endpoint
- `GET /api/quotes` - Get all quotes
- `GET /api/quotes/random` - Get a random quote
- `GET /api/health` - Health check endpoint

### Troubleshooting

1. Check container logs:
```bash
docker logs backend
```

2. Check container status:
```bash
docker ps
```

3. Check environment variables:
```bash
docker exec backend env
```

4. Check database connection:
```bash
docker exec backend npm run db:check
``` 
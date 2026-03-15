# Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Domain name (optional)
- SSL certificate (for production)
- AI API keys (Gemini or OpenRouter)

## Environment Setup

### 1. Production Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:strong_password@postgres:5432/ai_analyzer"

# Redis
REDIS_HOST="redis"
REDIS_PORT=6379
REDIS_PASSWORD="strong_redis_password"

# AI APIs
GEMINI_API_KEY="your-production-gemini-key"
OPENROUTER_API_KEY="your-production-openrouter-key"

# JWT
JWT_SECRET="your-super-secret-production-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# App
NODE_ENV="production"
BACKEND_PORT=4000
FRONTEND_URL="https://yourdomain.com"
BACKEND_URL="https://api.yourdomain.com"
```

## Docker Deployment

### Option 1: Docker Compose (Recommended for small-medium scale)

1. **Build images**
```bash
docker-compose -f docker-compose.prod.yml build
```

2. **Start services**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **Run migrations**
```bash
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### Option 2: Separate Containers

Build and push to registry:

```bash
# Backend
docker build -t your-registry/ai-analyzer-backend:latest -f apps/backend/Dockerfile .
docker push your-registry/ai-analyzer-backend:latest

# Frontend
docker build -t your-registry/ai-analyzer-frontend:latest -f apps/frontend/Dockerfile .
docker push your-registry/ai-analyzer-frontend:latest
```

## Cloud Deployment

### Vercel (Frontend)

1. Connect GitHub repository
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL`
3. Deploy automatically on push

### Railway/Render (Backend)

1. Connect GitHub repository
2. Set environment variables (all from .env)
3. Add PostgreSQL and Redis services
4. Deploy

### AWS (Full Stack)

**Services needed:**
- EC2 or ECS for containers
- RDS for PostgreSQL
- ElastiCache for Redis
- ALB for load balancing
- Route53 for DNS
- ACM for SSL

**Steps:**
1. Setup RDS PostgreSQL instance
2. Setup ElastiCache Redis cluster
3. Deploy containers to ECS
4. Configure ALB with SSL
5. Point domain to ALB

### DigitalOcean (App Platform)

1. Create new app from GitHub
2. Add components:
   - Backend (Node.js)
   - Frontend (Static Site)
   - PostgreSQL database
   - Redis database
3. Set environment variables
4. Deploy

## Database Migration

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database (if needed)
pnpm db:seed
```

## Monitoring

### Health Checks

Backend exposes health endpoint:
```
GET /health
```

### Logs

View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Metrics

Consider adding:
- Prometheus for metrics
- Grafana for visualization
- Sentry for error tracking

## Backup

### Database Backup

```bash
# Backup
docker-compose exec postgres pg_dump -U user ai_analyzer > backup.sql

# Restore
docker-compose exec -T postgres psql -U user ai_analyzer < backup.sql
```

### Automated Backups

Setup cron job:
```bash
0 2 * * * /path/to/backup-script.sh
```

## SSL/HTTPS

### Using Let's Encrypt

1. Install certbot
2. Generate certificate:
```bash
certbot certonly --standalone -d yourdomain.com
```

3. Configure nginx/traefik with certificates

### Using Cloudflare

1. Point domain to Cloudflare
2. Enable SSL/TLS (Full)
3. Point to your server IP

## Scaling

### Horizontal Scaling

1. **Backend**: Add more instances behind load balancer
2. **Queue Workers**: Increase worker count
3. **Database**: Use read replicas
4. **Redis**: Use Redis Cluster

### Vertical Scaling

Increase resources:
- CPU: 2+ cores
- RAM: 4GB+ for backend
- Storage: SSD recommended

## Performance Optimization

1. **Enable caching**
   - Redis for API responses
   - CDN for static assets

2. **Database optimization**
   - Add indexes
   - Connection pooling
   - Query optimization

3. **Frontend optimization**
   - Image optimization
   - Code splitting
   - Lazy loading

## Security Checklist

- [ ] Use strong passwords
- [ ] Enable HTTPS
- [ ] Set secure JWT secret
- [ ] Configure CORS properly
- [ ] Use environment variables
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor logs

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Verify Redis is running
- Check logs: `docker-compose logs backend`

### Database connection failed
- Verify PostgreSQL is running
- Check credentials
- Test connection: `psql $DATABASE_URL`

### Queue not processing
- Check Redis connection
- Verify worker is running
- Check queue logs

### Frontend can't reach backend
- Verify NEXT_PUBLIC_API_URL
- Check CORS settings
- Test API: `curl http://backend:4000/health`

## Support

For issues, open a GitHub issue or discussion.

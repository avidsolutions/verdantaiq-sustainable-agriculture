
# Peoria - Sustainable Urban Agriculture Platform

## Overview

Peoria is an advanced agricultural management system built for Onticworks.io, featuring comprehensive IBM Watson X integration for AI-powered farming operations. The platform manages automated vermiculture systems with real-time monitoring, predictive analytics, and intelligent workflow orchestration.

## Key Features

### 🤖 IBM Watson X Integration (50% of platform functionality)
- **Watson X.ai**: AI-powered analysis of environmental data and yield predictions
- **Watson Orchestrate**: Automated workflow management for feeding, harvesting, and maintenance
- **Watson Assistant**: Conversational AI interface for system management and troubleshooting

### 🌱 Agricultural Management
- **Environmental Monitoring**: Real-time temperature, moisture, and pH tracking
- **Vermiculture Management**: Comprehensive worm farming system control
- **Yield Optimization**: AI-driven predictions and recommendations
- **Performance Analytics**: Detailed efficiency and productivity metrics
- **Maintenance Management**: Predictive maintenance scheduling and execution

### 📊 Dashboard & Analytics
- **Main Dashboard**: Comprehensive system overview with real-time data
- **Environmental Dashboard**: Detailed environmental monitoring with charts
- **Production Analytics**: Yield trends, efficiency metrics, and forecasting
- **AI Insights Panel**: Watson-generated recommendations and risk assessments
- **Workflow Manager**: Visual workflow orchestration and monitoring

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **UI Components**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts for data visualization
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: IBM Watson X (AI, Orchestrate, Assistant)
- **State Management**: Zustand
- **API**: RESTful API with Next.js API routes

## Watson X Configuration

### Required Environment Variables

```bash
# IBM Watson X Configuration
WATSON_AI_API_KEY=your_watson_ai_api_key
WATSON_AI_URL=your_watson_ai_service_url
WATSON_AI_PROJECT_ID=your_watson_ai_project_id

# Watson Orchestrate Configuration
WATSON_ORCHESTRATE_API_KEY=your_orchestrate_api_key
WATSON_ORCHESTRATE_URL=your_orchestrate_service_url
WATSON_ORCHESTRATE_ENVIRONMENT_ID=your_orchestrate_environment_id

# Watson Assistant Configuration
WATSON_ASSISTANT_API_KEY=your_assistant_api_key
WATSON_ASSISTANT_URL=your_assistant_service_url
WATSON_ASSISTANT_ID=your_assistant_id

# IBM Cloud Configuration
IBM_CLOUD_API_KEY=your_ibm_cloud_api_key
IBM_CLOUD_REGION=us-south
```

### Watson X Services Setup

1. **Watson X.ai Setup**:
   - Create Watson Machine Learning service instance
   - Deploy environmental analysis model
   - Deploy yield prediction model
   - Configure project and deployment IDs

2. **Watson Orchestrate Setup**:
   - Create Watson Orchestrate environment
   - Define agricultural workflow templates
   - Configure automation triggers
   - Set up skill connections

3. **Watson Assistant Setup**:
   - Create Watson Assistant service instance
   - Train assistant with agricultural knowledge
   - Configure intents and entities for farming operations
   - Deploy assistant and obtain service credentials

## IBM Cloud Deployment

### Prerequisites

1. **IBM Cloud Account**: Active IBM Cloud account with appropriate services
2. **Watson X Services**: Provisioned Watson X.ai, Orchestrate, and Assistant instances
3. **Container Registry**: IBM Cloud Container Registry for Docker images
4. **Kubernetes Cluster**: IBM Cloud Kubernetes Service (IKS) cluster

### Deployment Steps

#### 1. Containerization

```dockerfile
# Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

#### 2. Build and Push to IBM Cloud Container Registry

```bash
# Login to IBM Cloud
ibmcloud login

# Target container registry
ibmcloud cr region-set us-south

# Build and tag image
docker build -t peoria-agricultural-platform .
docker tag peoria-agricultural-platform us.icr.io/peoria-namespace/peoria-agricultural-platform:latest

# Push to registry
docker push us.icr.io/peoria-namespace/peoria-agricultural-platform:latest
```

#### 3. Kubernetes Deployment Configuration

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: peoria-agricultural-platform
  labels:
    app: peoria-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: peoria-platform
  template:
    metadata:
      labels:
        app: peoria-platform
    spec:
      containers:
      - name: peoria-app
        image: us.icr.io/peoria-namespace/peoria-agricultural-platform:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: peoria-secrets
              key: database-url
        - name: WATSON_AI_API_KEY
          valueFrom:
            secretKeyRef:
              name: watson-secrets
              key: ai-api-key
        - name: WATSON_ORCHESTRATE_API_KEY
          valueFrom:
            secretKeyRef:
              name: watson-secrets
              key: orchestrate-api-key
        - name: WATSON_ASSISTANT_API_KEY
          valueFrom:
            secretKeyRef:
              name: watson-secrets
              key: assistant-api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: peoria-service
spec:
  selector:
    app: peoria-platform
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: peoria-ingress
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - peoria.onticworks.io
    secretName: peoria-tls
  rules:
  - host: peoria.onticworks.io
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: peoria-service
            port:
              number: 80
```

#### 4. Deploy to IBM Cloud Kubernetes Service

```bash
# Connect to IKS cluster
ibmcloud ks cluster config --cluster peoria-cluster

# Create secrets
kubectl create secret generic peoria-secrets \
  --from-literal=database-url="your-database-url"

kubectl create secret generic watson-secrets \
  --from-literal=ai-api-key="your-watson-ai-key" \
  --from-literal=orchestrate-api-key="your-orchestrate-key" \
  --from-literal=assistant-api-key="your-assistant-key"

# Deploy application
kubectl apply -f k8s/
```

### Environment Configuration

#### Production Environment Variables

```bash
# Application Configuration
NODE_ENV=production
NEXTAUTH_URL=https://peoria.onticworks.io
NEXTAUTH_SECRET=your-production-secret

# Database (IBM Cloud Databases for PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Watson X Services (Production)
WATSON_AI_API_KEY=prod_watson_ai_key
WATSON_AI_URL=https://us-south.ml.cloud.ibm.com
WATSON_AI_PROJECT_ID=prod_project_id

WATSON_ORCHESTRATE_API_KEY=prod_orchestrate_key
WATSON_ORCHESTRATE_URL=https://us-south.wa.cloud.ibm.com
WATSON_ORCHESTRATE_ENVIRONMENT_ID=prod_environment_id

WATSON_ASSISTANT_API_KEY=prod_assistant_key
WATSON_ASSISTANT_URL=https://api.us-south.assistant.watson.cloud.ibm.com
WATSON_ASSISTANT_ID=prod_assistant_id

# IBM Cloud Services
IBM_CLOUD_API_KEY=prod_ibm_cloud_key
IBM_CLOUD_REGION=us-south
```

## Performance Optimization

### Watson X Optimization
- Implement response caching for AI predictions
- Use batch processing for environmental data analysis
- Optimize workflow execution with parallel processing
- Implement intelligent retry mechanisms for service calls

### Application Performance
- Server-side rendering for critical paths
- Image optimization and lazy loading
- Database query optimization with proper indexing
- Real-time data streaming with WebSocket connections

### IBM Cloud Features
- **Auto-scaling**: Configure horizontal pod autoscaling based on CPU/memory usage
- **Load Balancing**: IBM Cloud Load Balancer for high availability
- **Monitoring**: IBM Cloud Monitoring and Logging for observability
- **Security**: IBM Cloud Security and Compliance Center integration

## Monitoring and Observability

### Application Monitoring
- Real-time system performance metrics
- Environmental data quality monitoring
- Watson X service health checks
- User activity and engagement tracking

### IBM Cloud Monitoring
- Kubernetes cluster resource utilization
- Application performance metrics
- Watson X service usage and costs
- Security and compliance monitoring

## Development

### Local Development Setup

```bash
# Clone repository
git clone <repository-url>
cd peoria-onticworks/app

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local

# Start development server
yarn dev
```

### Testing

```bash
# Run unit tests
yarn test

# Run integration tests
yarn test:integration

# Run Watson X integration tests
yarn test:watson
```

## Support and Documentation

- **IBM Watson X Documentation**: [https://www.ibm.com/watson](https://www.ibm.com/watson)
- **IBM Cloud Kubernetes Service**: [https://cloud.ibm.com/kubernetes/overview](https://cloud.ibm.com/kubernetes/overview)
- **Onticworks.io Platform**: Internal documentation and support
- **Technical Support**: Contact Onticworks.io technical team

## License

Proprietary - Onticworks.io
All rights reserved. This software is the property of Onticworks.io and is protected by copyright laws.

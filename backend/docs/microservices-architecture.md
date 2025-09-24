# E-commerce Microservices Architecture

## 🎯 Kiến trúc tổng quan

### 1. API Gateway (Kong/Nginx)
- Routing requests
- Authentication/Authorization  
- Rate limiting
- Load balancing
- CORS handling

### 2. Core Services

#### User Service (Port: 3001)
- User management
- Profile management  
- User authentication
- User roles & permissions

#### Auth Service (Port: 3002)
- JWT token management
- OAuth2 integration (Google, Facebook)
- Session management
- Password reset

#### Product Service (Port: 3003)
- Product catalog (SPU/SKU)
- Categories & Brands
- Product search (Elasticsearch)
- Inventory management

#### Order Service (Port: 3004)
- Order processing
- Order status tracking
- Payment integration
- Order history

#### Cart Service (Port: 3005)
- Shopping cart management
- Cart persistence
- Cart synchronization

#### Shop Service (Port: 3006)
- Shop management
- Shop verification
- Shop analytics
- Seller dashboard

#### Notification Service (Port: 3007)
- Email notifications
- Push notifications
- SMS notifications
- Notification templates

#### File Service (Port: 3008)
- File upload/download
- Image processing
- CDN integration
- Storage management

#### AI Chatbot Service (Port: 3009)
- Gemini AI integration
- FAQ handling
- Order tracking
- Customer support

### 3. Infrastructure Services

#### Message Broker (RabbitMQ/Apache Kafka)
- Event-driven communication
- Async messaging
- Event sourcing

#### Service Discovery (Consul/Eureka)
- Service registration
- Health checks
- Load balancing

#### Configuration Service
- Centralized configuration
- Environment management
- Secret management

#### Monitoring & Logging
- Distributed tracing (Jaeger)
- Metrics collection (Prometheus)
- Log aggregation (ELK Stack)

## 📊 Database per Service

### User Service
- PostgreSQL: Users, Profiles, Roles

### Product Service  
- PostgreSQL: Products, Categories, Brands
- Elasticsearch: Product search
- Redis: Product cache

### Order Service
- PostgreSQL: Orders, Order items
- Redis: Order cache

### Cart Service
- Redis: Cart data (fast access)
- PostgreSQL: Persistent cart

### Shop Service
- PostgreSQL: Shop data, Analytics

### Notification Service
- MongoDB: Notification logs
- Redis: Notification queue

## 🔄 Communication Patterns

### Synchronous
- HTTP/REST for direct queries
- GraphQL Federation for complex queries

### Asynchronous  
- Event-driven for business processes
- Message queues for reliable delivery
- Publish-Subscribe for notifications

## 🚀 Implementation Strategy

### Phase 1: Extract Services (Month 1-2)
1. User & Auth Services
2. Product Service  
3. Order Service

### Phase 2: Advanced Services (Month 3-4)
1. Cart Service
2. Shop Service
3. Notification Service

### Phase 3: Infrastructure (Month 5-6)
1. Service mesh (Istio)
2. Advanced monitoring
3. Auto-scaling
4. CI/CD pipelines

## 💡 Gợi ý cụ thể cho project của bạn

### 1. Bắt đầu với User Service (Dễ nhất)
```typescript
// services/user-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { UserModule } from './user.module';

async function bootstrap() {
  // HTTP Server
  const app = await NestFactory.create(UserModule);
  await app.listen(3001);

  // Microservice
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'user_queue',
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
```

### 2. API Gateway Pattern với Kong/Nginx
```yaml
# docker-compose.yml
services:
  api-gateway:
    image: kong:latest
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /kong.yml
    ports:
      - "8000:8000"
    volumes:
      - ./kong.yml:/kong.yml

  user-service:
    build: ./services/user-service
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:pass@user-db:5432/userdb

  product-service:
    build: ./services/product-service  
    ports:
      - "3003:3003"
```

### 3. Event-Driven Architecture
```typescript
// Trong Order Service
@Injectable()
export class OrderService {
  constructor(private eventBus: EventBus) {}

  async createOrder(orderDto: CreateOrderDto) {
    const order = await this.orderRepo.save(orderDto);
    
    // Emit event to other services
    await this.eventBus.emit('order.created', {
      orderId: order.id,
      userId: order.userId,
      amount: order.total
    });
    
    return order;
  }
}

// Trong Inventory Service
@EventHandler('order.created')
async handleOrderCreated(event: OrderCreatedEvent) {
  await this.updateInventory(event.orderId);
}
```

### 4. Database per Service
```
user-service -> user_db (PostgreSQL)
product-service -> product_db (PostgreSQL) + Elasticsearch + Redis
order-service -> order_db (PostgreSQL)  
cart-service -> Redis (fast access)
notification-service -> MongoDB (logs)
```

### 5. Service Discovery với Consul
```typescript
// service-registry.ts
@Injectable()
export class ServiceRegistry {
  async registerService(serviceName: string, port: number) {
    await consul.agent.service.register({
      name: serviceName,
      port: port,
      check: {
        http: `http://localhost:${port}/health`,
        interval: '10s'
      }
    });
  }
}
```

### 6. Shared Libraries
```
libs/
  common/
    dto/
    interfaces/
    decorators/
    guards/
  database/
    prisma/
  messaging/
    events/
    patterns/
```

## 🔧 Tools & Technologies đề xuất

### Development
- **API Gateway**: Kong, Nginx, AWS API Gateway
- **Service Mesh**: Istio, Linkerd
- **Message Broker**: RabbitMQ (đã có), Apache Kafka
- **Service Discovery**: Consul, Eureka

### Monitoring & Observability  
- **Distributed Tracing**: Jaeger, Zipkin
- **Metrics**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Health Checks**: Custom endpoints + Consul

### Deployment
- **Containerization**: Docker (đã có)
- **Orchestration**: Kubernetes, Docker Swarm
- **CI/CD**: GitHub Actions, GitLab CI
- **Infrastructure**: Terraform, Ansible

## 🎯 Lộ trình thực hiện

### Tuần 1-2: Setup Infrastructure
- Docker Compose cho local development
- API Gateway setup
- Service discovery
- Shared libraries

### Tuần 3-4: User Service
- Extract user module
- Setup database migration
- API integration
- Testing

### Tuần 5-6: Product Service  
- Extract product + search
- Elasticsearch integration
- Event publishing
- Performance testing

### Tuần 7-8: Order Service
- Order processing logic
- Payment integration
- Event handling
- Transaction management

### Sau đó: Từng service một theo roadmap

## ⚠️ Challenges cần chuẩn bị

1. **Data Consistency**: Implement Saga pattern
2. **Distributed Transactions**: Use event sourcing
3. **Network Latency**: Caching strategies
4. **Service Dependencies**: Circuit breaker pattern  
5. **Testing**: Contract testing, integration tests
6. **Monitoring**: Distributed tracing setup
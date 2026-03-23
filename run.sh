#!/bin/bash

export DB_PASSWORD=JznJ2xENg5NqQ3Yq

# Start backend in background (from root)
./mvnw spring-boot:run &

# Start frontend from its directory
cd src/main/java/com/genbridge/frontend
npm run dev
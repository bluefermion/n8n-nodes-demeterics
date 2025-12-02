#!/bin/bash
sudo docker compose -f /opt/n8n/docker-compose.yml restart n8n
# sudo docker exec -it n8n sh -lc 'ls -la /home/node/.n8n/custom/node_modules/n8n-nodes-demeterics/dist/nodes'


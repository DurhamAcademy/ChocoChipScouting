mkdir /home/ubuntu/webapp
echo "running start-production"
cd /home/ubuntu/webapp
cat /home/ubuntu/.CR_PAT.txt | sudo docker login ghcr.io -u da-robotics --password-stdin
sudo docker compose pull
sudo docker compose down server
sudo docker compose up -d server
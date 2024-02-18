


mkdir /home/ubuntu/webapp
cd /home/ubuntu/webapp
cat /home/ubuntu/.CR_PAT.txt | sudo docker login ghcr.io -u a1cd --password-stdin
sudo docker compose -f compose.yaml up -d --build
# Ansible Deployment - Zomato DevOps Pipeline

This directory contains Ansible playbooks and configuration for deploying the Zomato application to AWS EC2.

## 📁 File Structure

```
ansible/
├── ansible.cfg          # Ansible configuration
├── inventory            # Server inventory (EC2 IPs)
├── deploy.yml           # Main deployment playbook
├── ping.yml             # Connection test playbook
├── templates/
│   └── backend.env.j2   # Backend environment template
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Install Ansible**
   ```bash
   # macOS
   brew install ansible
   
   # Ubuntu/Debian
   sudo apt update && sudo apt install ansible -y
   
   # Verify installation
   ansible --version
   ```

2. **Ensure Terraform is applied**
   - EC2 instance must be running
   - Note the public IP from terraform output

3. **Update Inventory**
   ```bash
   cd ansible
   # Edit inventory file and update the IP address
   # Get IP: cd ../infra/terraform && terraform output instance_public_ip
   ```

### Deployment Steps

1. **Test connectivity**
   ```bash
   cd ansible
   ansible-playbook ping.yml
   ```

2. **Deploy application**
   ```bash
   ansible-playbook deploy.yml
   ```

3. **Access your application**
   - Frontend: `http://<EC2_IP>:3000`
   - Backend: `http://<EC2_IP>:4000`

## 📖 Playbook Details

### deploy.yml - Main Deployment

**What it does:**
1. ✅ Waits for EC2 user-data setup to complete
2. ✅ Verifies Docker is installed and running
3. ✅ Clones/updates application code from GitHub
4. ✅ Creates environment configuration files
5. ✅ Stops existing containers (if any)
6. ✅ Builds and starts Docker containers
7. ✅ Performs health checks
8. ✅ Displays deployment summary

**Run with verbose output:**
```bash
ansible-playbook deploy.yml -v
```

**Run specific tasks:**
```bash
# Only update code and restart
ansible-playbook deploy.yml --tags deploy
```

### ping.yml - Connection Test

Simple playbook to verify Ansible can connect to servers.

```bash
ansible-playbook ping.yml
```

## 🔧 Configuration

### Inventory Variables

Edit `inventory` to customize:

```ini
[app_servers:vars]
app_dir=/home/ubuntu/zomato-app          # App installation directory
environment=production                    # Environment name
```

### Environment Templates

The `templates/backend.env.j2` file creates the backend `.env` with:
- Database connection strings
- JWT secret keys
- CORS configuration
- Server settings

**To use custom values**, edit the template before deployment.

## 🎯 Common Tasks

### Deploy after code changes
```bash
ansible-playbook deploy.yml
```

### Check application status
```bash
ansible app_servers -m shell -a "docker ps" -b
```

### View container logs
```bash
ansible app_servers -m shell -a "cd /home/ubuntu/zomato-app && docker compose logs --tail=50" -b
```

### Restart containers
```bash
ansible app_servers -m shell -a "cd /home/ubuntu/zomato-app && docker compose restart" -b
```

### Stop application
```bash
ansible app_servers -m shell -a "cd /home/ubuntu/zomato-app && docker compose down" -b
```

### Update and redeploy
```bash
# Pull latest code and restart
ansible app_servers -m shell -a "cd /home/ubuntu/zomato-app && git pull && docker compose up -d --build" -b
```

## 🔐 Security Best Practices

### Use Ansible Vault for Secrets

1. **Create encrypted variables file:**
   ```bash
   ansible-vault create secrets.yml
   ```

2. **Edit encrypted file:**
   ```bash
   ansible-vault edit secrets.yml
   ```

3. **Use in playbook:**
   ```bash
   ansible-playbook deploy.yml --ask-vault-pass
   ```

### Example secrets.yml structure:
```yaml
db_password: "your-secure-password"
jwt_secret: "your-secret-key"
```

## 🐛 Troubleshooting

### Issue: "Host key verification failed"
**Solution:** Already handled in `ansible.cfg` with `host_key_checking = False`

### Issue: "Permission denied (publickey)"
**Solution:** 
- Verify key path in inventory: `~/.ssh/zomato-deploy-key.pem`
- Check key permissions: `chmod 400 ~/.ssh/zomato-deploy-key.pem`
- Test SSH manually: `ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@<IP>`

### Issue: "Docker command not found"
**Solution:** 
- Wait 2-3 minutes for EC2 user-data script to complete
- Check: `ansible app_servers -m shell -a "cat /var/log/user-data.log" -b`

### Issue: Containers not starting
**Solution:**
```bash
# SSH into server
ssh -i ~/.ssh/zomato-deploy-key.pem ubuntu@<IP>

# Check logs
cd /home/ubuntu/zomato-app
docker compose logs

# Check disk space
df -h

# Restart Docker service
sudo systemctl restart docker
```

### Issue: Port already in use
**Solution:**
```bash
ansible app_servers -m shell -a "cd /home/ubuntu/zomato-app && docker compose down" -b
ansible-playbook deploy.yml
```

## 📊 Monitoring

### Check application health
```bash
# Backend health
curl http://<EC2_IP>:4000

# Frontend health  
curl http://<EC2_IP>:3000

# Database connection
ansible app_servers -m shell -a "docker exec zomato-app-db-1 psql -U postgres -d zomato -c 'SELECT 1'" -b
```

### View real-time logs
```bash
ansible app_servers -m shell -a "cd /home/ubuntu/zomato-app && docker compose logs -f" -b
```

## 🔄 Re-deployment Workflow

For updates after code changes:

```bash
# 1. Commit and push your changes
git add .
git commit -m "Update feature"
git push origin main

# 2. Deploy to server
cd ansible
ansible-playbook deploy.yml

# 3. Verify deployment
curl http://<EC2_IP>:3000
```

## 📚 Advanced Usage

### Deploy to multiple environments

Create separate inventory files:
```bash
inventory.dev
inventory.staging  
inventory.prod
```

Deploy to specific environment:
```bash
ansible-playbook -i inventory.prod deploy.yml
```

### Use tags for partial deployment

Add tags to tasks in `deploy.yml`, then run:
```bash
# Only deploy code
ansible-playbook deploy.yml --tags code

# Only restart containers
ansible-playbook deploy.yml --tags restart
```

## 🔗 Next Steps

After successful deployment:

1. ✅ Test your application thoroughly
2. ✅ Set up monitoring and alerts
3. ✅ Proceed to Jenkins CI/CD (Phase 2)
4. ✅ Consider adding:
   - SSL/TLS certificates
   - Domain name configuration
   - Database backups
   - Log aggregation

## 📞 Support

For issues or questions:
- Check Terraform outputs: `cd ../infra/terraform && terraform output`
- Review Ansible logs with `-vvv` flag for detailed output
- Verify EC2 instance security groups allow required ports

## 📖 Resources

- [Ansible Documentation](https://docs.ansible.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [AWS EC2 Best Practices](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/best-practices.html)

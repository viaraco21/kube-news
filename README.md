
Projeto Pipeline - SRE | Analista de DevOps | Automatização e Integração Contínua

Tarefa: Criar um pipeline de CI/CD usando o GitHub Actions para um projeto simples de aplicação web.

Neste projeto eu utilizei o cluster kubernetes da cloud.digitalocean e configurei o secrets K8S_CONFIG para receber o seu arquivo kube config.

Comando
~/.kube/config

export KUBECONFIG=/mnt/c/Users/renatooliveira/Downloads/k8s-raco-kubeconfig

mkdir -p ~/.kube
cp "/mnt/c/Users/renat/Downloads/k8s-1-37-2-raco-kubeconfig.yaml" ~/.kube/config
chmod 600 ~/.kube/config

*****************************************************************************************************************************************************

Requisitos:

1. O pipeline deve ser ativado sempre que um novo commit for feito na branch main. ✔

2. O pipeline deve executar os seguintes passos: 
o Instalar as dependências do projeto. ✔
o Executar testes unitários. ✔
o Construir a aplicação. ✔
o Armazenar o artefato como release do github ✔
o Usar funcionalidade environment do github para restringir a aprovação do deploy para um usuário ou grupo do github ✔

3. Criar uma step com o SonarQube para analisar a qualidade e a segurança do código. ✔

4. Executa o Trivy para fazer o scan de vulnerabilidades na imagem Docker recém-criada. ✔

5. O pipeline deve notificar o desenvolvedor via e-mail se o processo de CI/CD falhar em qualquer etapa e no final quando finalizar. ✔

6. Se todos os passos acima forem bem-sucedidos, o pipeline deve fazer o deploy da 
aplicação em um ambiente de teste. ✔

7. Comando para fazer o Rollback:
Executar dentro do diretorio k8s
kubectl rollout undo deployment/kubenews

• Criar um desenho simples de arquitetura na ferramenta draw.io (diagrams.net) que mostre como sera estruturado o pipeline.

https://drive.google.com/file/d/1QEG4VXxvf_BTn3m2n3Eupf1EOoleVIxf/view?usp=drive_link

*****************************************************************************************************************************************************
Configuração do MCP IA

{
    "mcpServers": {
        "filesystem": {
            "command": "docker",
            "args": [
                "run",
                "-i",
                "--rm",
                "-v",
                "\\\\wsl.localhost\\Ubuntu\\home\\fabricioveronez\\projetos:/projetos",
                "mcp/filesystem",
                "/projetos"
            ]
        },
        "kubernetes": {
            "command": "docker",
            "args": [
                "run",
                "-i",
                "--rm",
                "-v",
                "\\\\wsl.localhost\\Ubuntu\\home\\fabricioveronez\\.kube:/home/appuser/.kube",
                "mcp/kubernetes"
            ]
        },
        "prometheus": {
            "command": "docker",
            "args": [
                "run",
                "--rm",
                "-i",
                "-e",
                "PROMETHEUS_URL",
                "fabriciosveronez/prometheus-mcp-server:v1"
            ],
            "env": {
                "PROMETHEUS_URL": "http://138.197.230.72:80"
            }
        }
    }
}

*****************************************************************************************************************************************************

Link para ter $ 200 na Digital Ocean

https://m.do.co/c/a939ecc60dfa

## Monitoramento com Prometheus e Grafana

A aplicação expõe métricas Prometheus em `/metrics`. O Prometheus coleta essas métricas e o Grafana já vem provisionado com a fonte de dados e um dashboard de requisições, latência, erros HTTP e memória.

### Executar localmente com Docker Compose

Na raiz do projeto:

```bash
docker compose up --build -d
```

- Aplicação: http://localhost:8080
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (usuário `admin`, senha inicial `admin`)

Prometheus e Grafana ficam publicados apenas em `localhost`. Altere a senha inicial do Grafana após o primeiro acesso. Para parar os serviços: `docker compose down`.

### Executar no Kubernetes

O manifesto `k8s/monitoring.yaml` cria o namespace `monitoring`, Prometheus e Grafana. Antes de aplicar, crie uma senha de administrador do Grafana (substitua pelo valor que deseja usar):

```bash
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
kubectl -n monitoring create secret generic grafana-admin --from-literal=password='SUA_SENHA_FORTE' --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f k8s/cluster-metrics.yaml
kubectl apply -f k8s/monitoring.yaml
```

O manifesto adicional instala `kube-state-metrics`, `node-exporter` e a permissão de leitura usada pelo Prometheus para descobrir os nós e consultar métricas de containers via kubelet.

Para recuperar a senha do Grafana configurada no cluster:

```bash
kubectl -n monitoring get secret grafana-admin -o jsonpath='{.data.password}' | base64 --decode; echo
```

No cluster configurado, o Grafana recebe um IP externo pelo serviço `LoadBalancer`. Consulte o endereço com:

```bash
kubectl -n monitoring get service grafana
```

Acesse `http://IP-EXTERNO:3000` com usuário `admin` e a senha criada. O Prometheus permanece interno ao cluster e é consultado pelo Grafana.

Os dados de Prometheus e Grafana usam armazenamento temporário no Kubernetes; eles serão perdidos se os pods forem recriados. Para retenção permanente, configure PersistentVolumes para esses Deployments.




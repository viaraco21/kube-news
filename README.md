
Projeto Pipeline - SRE | Analista de DevOps | Automatização e Integração Contínua

Tarefa: Criar um pipeline de CI/CD usando o GitHub Actions para um projeto simples de aplicação web.

Neste projeto eu utilizei o cluster kubernetes da cloud.digitalocean e configurei o secrets K8S_CONFIG para receber o seu arquivo kube config.

Comando
~/.kube/config

export KUBECONFIG=/mnt/c/Users/renat/Downloads/k8s-1-37-2-raco-kubeconfig.yaml
echo "$KUBECONFIG"
kubectl get nodes

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

Agora tem um workflows para fazer este passo

• Criar um desenho simples de arquitetura na ferramenta draw.io (diagrams.net) que mostre como sera estruturado o pipeline.

https://drive.google.com/file/d/1QEG4VXxvf_BTn3m2n3Eupf1EOoleVIxf/view?usp=drive_link

## Monitoring do Kubernetes

O monitoring reúne métricas da aplicação e do cluster Kubernetes:

- **Prometheus** coleta as métricas a cada 15 segundos e as mantém por até 7 dias. O armazenamento atual é temporário; os dados históricos são perdidos se o pod do Prometheus for recriado.
- **A aplicação KubeNews** expõe métricas HTTP e do processo no endpoint `/metrics`.
- **kube-state-metrics** coleta estados de nós, pods e deployments.
- **node-exporter** coleta métricas de CPU, memória e disco dos nós Linux.
- **cAdvisor**, via kubelet, coleta métricas de CPU e memória dos containers.
- **Grafana** consulta o Prometheus e provisiona automaticamente o dashboard **KubeNews - Aplicação**.

### Pré-requisitos

- `kubectl` configurado para o cluster correto (`kubectl get nodes`).
- Aplicação implantada no namespace `default`, com o Service `kubenews` ativo. O Prometheus acessa o endpoint de métricas pelo DNS interno `kubenews.default.svc.cluster.local:80`.
- Acesso do Prometheus ao endpoint do kubelet na porta `10250` dos nós, necessário para as métricas do cAdvisor.

### Instalação

O manifesto principal é `k8s/monitoring.yaml`. Ele cria os recursos de Prometheus, Grafana, permissões de leitura do cluster, kube-state-metrics e node-exporter. O arquivo `k8s/cluster-metrics.yaml` contém recursos de exporters que já estão incluídos no manifesto principal; aplique apenas `k8s/monitoring.yaml`.

O Secret `grafana-admin` precisa existir antes de iniciar o Grafana. Crie o namespace e o Secret (substitua o valor de exemplo por uma senha forte) e aplique o manifesto:

```bash
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
kubectl create secret generic grafana-admin \
  --namespace monitoring \
  --from-literal=password='TROQUE_POR_UMA_SENHA_FORTE' \
  --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f k8s/monitoring.yaml
```

Para verificar se os componentes iniciaram:

```bash
kubectl get pods,svc -n monitoring
```

### Acesso e validação

Para acessar as interfaces localmente, use encaminhamento de porta em dois terminais:

```bash
kubectl port-forward -n monitoring svc/grafana 3000:3000
```

```bash
kubectl port-forward -n monitoring svc/prometheus 9090:9090
```

- Grafana: <http://localhost:3000> — usuário `admin`; senha definida no Secret `grafana-admin`. O dashboard fica na pasta **KubeNews**.
- Prometheus: <http://localhost:9090> — em **Status > Targets**, verifique se os jobs `kubenews`, `kube-state-metrics`, `node-exporter` e `kubelet-cadvisor` estão `UP`.

O Service do Grafana no manifesto está como `LoadBalancer`, o que pode criar um endereço público no cluster mesmo quando você usa `port-forward`. Para mantê-lo acessível somente localmente, altere seu tipo para `ClusterIP` antes de aplicar o manifesto e use o encaminhamento de porta acima. Não exponha o Grafana publicamente sem configurar TLS e controles de acesso apropriados.

O manifesto `k8s/monitoring.yaml` contém as ConfigMaps usadas pelo cluster. Alterações nos arquivos em `monitoring/` não são aplicadas automaticamente; mantenha também as ConfigMaps do manifesto sincronizadas quando editar as configurações ou o dashboard.

*****************************************************************************************************************************************************
## Configuração opcional do MCP de IA

MCP (Model Context Protocol) permite que um cliente de IA use ferramentas externas. Esta configuração conecta o cliente ao projeto, ao cluster Kubernetes e ao Prometheus. Ela **não instala nem inicia** o monitoring; para isso, siga a seção anterior.

São iniciados três servidores MCP em containers Docker:

- **filesystem**: dá acesso somente à pasta montada como `/projetos`. Aponte o volume para a pasta do projeto no seu computador.
- **kubernetes**: conecta ao cluster usando o kubeconfig montado em `/home/appuser/.kube`. As operações disponíveis respeitam as permissões desse kubeconfig; prefira uma credencial com acesso mínimo necessário.
- **prometheus**: consulta as métricas no endereço definido em `PROMETHEUS_URL`.

#### Como configurar

1. Instale e inicie o Docker (no Windows/WSL, habilite a integração com a distribuição WSL usada pelo projeto).
2. Confirme que o kubeconfig funciona no terminal (`kubectl get nodes`) e ajuste o caminho do volume `kubernetes` para o diretório que contém o arquivo `config`.
3. Para que o container MCP acesse o Prometheus localmente no Docker Desktop, mantenha um encaminhamento ativo em um terminal:

   ```bash
   kubectl port-forward -n monitoring svc/prometheus 9090:9090
   ```

   O endereço correspondente no exemplo abaixo é `http://host.docker.internal:9090`. Se o Prometheus estiver acessível por outro endereço, use esse endereço em `PROMETHEUS_URL`.
4. Copie o objeto `mcpServers` abaixo para a configuração de MCP do seu cliente de IA. Substitua os caminhos de exemplo por caminhos absolutos acessíveis ao Docker (não basta trocar o usuário se o projeto estiver em outra pasta) e confirme que o cliente consegue executar `docker`.

O exemplo de caminhos usa a distribuição WSL chamada `Ubuntu` e pressupõe que o kubeconfig esteja em `~/.kube/config`. Se a distribuição tiver outro nome, ajuste `wsl.localhost\Ubuntu`. Se o kubeconfig tiver outro nome ou estiver em outra pasta, ajuste o volume para montá-lo como `/home/appuser/.kube/config` dentro do container Kubernetes. Não compartilhe nem versione credenciais do Kubernetes; o kubeconfig deve permanecer fora do repositório.

```json
{
    "mcpServers": {
        "filesystem": {
            "command": "docker",
            "args": [
                "run",
                "-i",
                "--rm",
                "-v",
                "\\\\wsl.localhost\\Ubuntu\\home\\SEU_USUARIO\\projetos:/projetos",
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
                "\\\\wsl.localhost\\Ubuntu\\home\\SEU_USUARIO\\.kube:/home/appuser/.kube:ro",
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
                "PROMETHEUS_URL": "http://host.docker.internal:9090"
            }
        }
    }
}
```

*****************************************************************************************************************************************************

Link para ter $ 200 na Digital Ocean

https://m.do.co/c/a939ecc60dfa




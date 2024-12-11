# Curiosity Report: Netflix DevOps Practices

## Technologies
Netflix uses a sophisticated set of tools to enable their DevOps processes. Their technology stack supports continuous integration, continuous delivery, resilience testing, and large-scale deployment. Some of their key technologies are:

### Continuous Integration and Delivery
- **Spinnaker**: Netflix’s open-source continuous delivery platform is used to automate deployments across multiple environments. They also use this technology to do canary testing to make sure changes work before rolling them out globally.
- **Jenkins**: They us this to automate builds and run tests. It uses GitHub to trigger pipelines on every commit.
- **GitHub**: They, like everyone else, use github to manage source code and trigger CI/CD pipelines. The tools for code review, collaboration, and branch management that github supplies is top tier, so why use anything else.
- **Gradle**: A build tool they use for dependency management and creating reproducible builds. It supports a wide range of plugins for project customization.

### Automation and Infrastructure
- **Simian Army**: Netflix created simian army that includes three main tools: chaos monkey, janitor monkey, and latency monkey. Like all chaos testing tools, chaos monkey deliberately introduces failures in systems to make sure they run as expected. Janitor monkey automatically cleans up unused resources and checks less used code. Latency monkey tests their systems by creating artificial delays in service response times.
- **Terraform**: This is an infrastructure as Code (IaC) tool Netflix uses for provisioning consistent cloud resources. It also enables version control for infrastructure configurations.
- **Docker**: As we learned in class, Docker works great for packaging applications into containers for consistent environments across development, staging, and production.
- **Kubernetes**: This tech utilizes containerized microservices for scalability and simplified management. It provides automated scaling and self-healing for workloads.

### Testing and Observability
- **Kayenta**: A canary analysis tool integrated with Spinnaker for automated performance and error monitoring during incremental rollouts. It helps detect issues in real-time during rollouts.
- **Atlas**: Netflix’s telemetry system for real-time monitoring and metric collection. Every company needs metrics, and atlas provides dashboards and alerts for these critical system metrics.
- **Selenium** and **JUnit**: Testing is one of the most important parts of creating usable code, and netflix uses these for frameworks for end-to-end and unit testing, respectively. Selenium automates browser testing, while JUnit supports parameterized tests.

---

## Teams
Netflix has spent a lot of time creating their team structure and culture in order to ensure their DevOps success. I like how Netflix created these teams, which are small, autonomous, and take ownership of their services.

### Team Size and Composition
- **Small Teams**: They typically have 5-10 engineers per team which allows them to create code quickly and generate new and creative ideas. These teams often include everyone necessary to develope their products, including developers, testers, and operations specialists.
- **Roles**:
  - **Software Engineers**: They, of course, develop and maintain their socalled 'microservices'. They often specialize in specific domains like streaming or personalization.
  - **Site Reliability Engineers (SREs)**: These engineers have a pretty self explanatory name. They focus on system reliability, automation, and failover strategies. They work closely with the software engineers.
  - **DevOps Engineers**: Just like we have been doing in class, they build and maintain CI/CD pipelines and automate repetitive tasks. They keep up with the current best practices and make sure each member of their teams are on board.
  - **Data Scientists**: Every team needs a few data scientists to analyze user data and make sure systems perform as good as they can through machine learning models.

### Culture of Ownership
- Engineers are responsible for the entire lifecycle of their services, from development to production monitoring. This "you build it, you run it" approach makes teams more accountable for, and proud of, their own work.
- Teams collaborate closely without much hierarchy which seems to boost innovation and accountability. They have regular hackathons. What could be more fun.

---

## Strategies
Netflix uses innovative strategies for resilience, scalability, and efficiency in their operations.

### Microservices Architecture
- Netflix uses a microservices approach where each service is independently developed, deployed, and scaled. This modular design enables teams to work concurrently without affecting other services.
- Services communicate via APIs and often use protocols like gRPC for good inter service communication.

### Resilience and Testing
- **Chaos Engineering**: Tools like Chaos Monkey introduce controlled failures to test system resilience. Regular chaos drills give teams confidence for unexpected issues.
- **Auto-Healing Systems**: Automated scripts detect and resolve failures by restarting services or rerouting traffic. These systems minimize downtime and user impact.
- **Canary Testing**: New features are rolled out to a small subset of users and monitored for issues before global deployment. This of course helps catch bugs in a live environment.

### Deployment and Rollout
- **Incremental Deployments**: Changes are deployed incrementally using Spinnaker which allows for quick rollback in case of failures. Deployment pipelines include detailed approvals and quality gates.
- **Feature Toggles**: Dynamic switches enable engineers to toggle features on and off without redeploying code. This easily supports A/B testing for feature validation.

### Observability and Incident Management
- **Real-Time Monitoring**: Atlas and other tools provide insights into application performance. This ensures quick detection of anomalies. Custom dashboards are created for critical workflows.
- **Postmortems**: After incidents, teams conduct analyses to identify root causes and prevent issues from recurring. They say they have a "no-blame" culture. The documentation from postmortems are shared widely for organizational learning.

---

By combining cutting-edge technologies, a culture of ownership, and innovative strategies, Netflix sets a benchmark in DevOps excellence. Their approach demonstrates the power of integrating automation, resilience, and team autonomy to achieve large-scale, reliable software delivery.

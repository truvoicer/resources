##  List of useful commands for AWS ECR, ECS, CLI
#### AWS CloudFormation
* List Stacks

        aws cloudformation list-stacks
        
* Delete stack

        aws cloudformation delete-stack --stack-name your_stack_name
        
#### AWS Create Cluster Commands
* Create a new cluster

        ecs-cli up --keypair [keypair] --capability-iam --size 1 --instance-type [instance-type] --cluster [cluster-name] --security-group [security-group-id] --vpc [vpc-id] --subnets [comma-seperated-subnet-id-list] --force
        
#### Tasks
* Run a task

        aws ecs run-task --cluster [cluster-name] --task-definition [task-definition-name]

* Stop a task

        aws ecs stop-task --cluster [cluster-name] --task 
 
#### AWS Task Definitions
* Task definition list

        aws ecs list-tasks --cluster [cluster-name]

* Register a task definition

        aws ecs register-task-definition --family [task-definition-name] --cli-input-json file://task-definition.json


#### AWS Service Commands
* Create a service

        aws ecs create-service --service-name [service-name] --cluster [cluster-name] --desired-count 1 --task-definition [task-definition-name]
        
* Update a service

        aws ecs update-service --cluster [cluster-name] --service [service-name] --desired-count 1 --task-definition [task-definition-name] --force-new-deployment
            
    
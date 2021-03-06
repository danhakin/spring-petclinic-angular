#!/bin/bash

# Login to ECR
DOCKER_LOGIN=`aws ecr get-login --region eu-west-1 --no-include-email`
${DOCKER_LOGIN}

# Prepare ECS Service
REGION=eu-west-1
REPOSITORY_NAME=spring-petclinic-front
CLUSTER=ecs-devops
FAMILY=`sed -n 's/.*"family": "\(.*\)",/\1/p' taskdef.json`
NAME=`sed -n 's/.*"name": "\(pet.*\)",/\1/p' taskdef.json`
SERVICE_NAME=${FAMILY}-app

# Include load balancer info
TARGET_GROUP=arn:aws:elasticloadbalancing:eu-west-1:935517557789:targetgroup/petclinic/e8e75155cfd1f319
LOAD_BALANCER=petclinic-lb
CONTAINER_NAME=${NAME}
CONTAINER_PORT=80

# Get API latest tag in ECR
API_TAG=`aws ecr describe-images --repository-name spring-petclinic-rest --region ${REGION} --output text --query 'sort_by(imageDetails,& imagePushedAt)[*].imageTags[*]' | tr '\t' '\n' | tail -1`
echo "API version: ${API_TAG}"

echo "-- Store the repositoryUri as a variable"
#Store the repositoryUri as a variable
REPOSITORY_URI=`aws ecr describe-repositories --repository-names ${REPOSITORY_NAME} --region ${REGION} | jq .repositories[].repositoryUri | tr -d '"'`

echo "-- Replace the build number and respository URI placeholders with the constants above"
#Replace the build number and respository URI placeholders with the constants above
sed -e "s;%BUILD_NUMBER%;${BUILD_NUMBER};g" -e "s;%REPOSITORY_URI%;${REPOSITORY_URI};g" -e "s;%API_TAG%;${API_TAG};g" taskdef.json > ${NAME}-${BUILD_NUMBER}.json

echo "-- Register the task definition in the repository"
#Register the task definition in the repository
aws ecs register-task-definition --family ${FAMILY} --cli-input-json file://${WORKSPACE}/${NAME}-${BUILD_NUMBER}.json --region ${REGION}
SERVICES=`aws ecs describe-services --services ${SERVICE_NAME} --cluster ${CLUSTER} --region ${REGION} | jq .failures[]`

echo "-- Get latest revision"
#Get latest revision
REVISION=`aws ecs describe-task-definition --task-definition ${FAMILY} --region ${REGION} | jq .taskDefinition.revision`

echo "-- Create or update service"
#Create or update service
if [ "$SERVICES" == "" ]; then
  echo "entered existing service"
  DESIRED_COUNT=`aws ecs describe-services --services ${SERVICE_NAME} --cluster ${CLUSTER} --region ${REGION} | jq .services[].desiredCount`
  if [ ${DESIRED_COUNT} = "0" ]; then
    DESIRED_COUNT="1"
  fi
  aws ecs update-service --cluster ${CLUSTER} --region ${REGION} --service ${SERVICE_NAME} --task-definition ${FAMILY}:${REVISION} --desired-count ${DESIRED_COUNT}
else
  echo "entered new service"
  #aws ecs create-service --service-name ${SERVICE_NAME} --desired-count 1 --task-definition ${FAMILY} --cluster ${CLUSTER} --region ${REGION}
  aws ecs create-service \
    --service-name ${SERVICE_NAME} \
    --desired-count 1 \
    --task-definition ${FAMILY} \
    --cluster ${CLUSTER} \
    --region ${REGION} \
    --load-balancers "targetGroupArn=${TARGET_GROUP},containerName=${CONTAINER_NAME},containerPort=${CONTAINER_PORT}"
fi

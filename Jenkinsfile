pipeline {
    agent any
    environment {
        CI = 'true'
    }
    tools {
        nodejs 'nodejs'
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/danhakin/spring-petclinic-angular.git', credentialsId: 'github-danhakin', branch: 'master'            
            }
        }
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        stage('API Testing') {
            steps {
                script {
                    docker.withRegistry("https://935517557789.dkr.ecr.eu-west-1.amazonaws.com/spring-petclinic-rest","ecr:eu-west-1:aws-ecr-repo"){
                        docker.image('spring-petclinic-rest:22').withRun('-p 9966:9966') { c -> 
                            sh 'while ! curl localhost:9966; do sleep 1; done'
                            sh 'npm run apiTest'    
                        }
                    }
                }
            }
            post {
               always {
                    junit 'api-report.xml'
                }
            }
        }
        stage('Functional Testing') {
            steps {
                sh 'npm run test-ci'
            }
            post {
               always {
                    junit 'TESTS-*.xml'
                }
            }
        }
        stage('Push image') {
            steps {
                sh 'echo Uploading docker image to ECR'
                sh 'npm run dist'
                script {
                  app = docker.build("spring-petclinic-front:${env.BUILD_ID}")
                    docker.withRegistry("https://935517557789.dkr.ecr.eu-west-1.amazonaws.com/spring-petclinic-front","ecr:eu-west-1:aws-ecr-repo"){
                        app.push()
                    }  
                }
            }
        }
        stage('Deliver') {
            steps {
                sh 'echo Deploying to ECS Cluster'
                sh 'ls -la'
                sh './deploy.sh'
            }
        }
    }
}